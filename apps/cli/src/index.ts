import type { ActionParameters } from '@caporal/core';
import { program } from '@caporal/core';
import chalk from 'chalk';
import 'dotenv/config';
import fs from 'fs/promises';
import gql from 'graphql-tag';
import { ANALYSIS_ID, CLONE_DIRECTORY } from './lib/constants';
import executeCommand from './lib/executeCommand';
import fetchRepository from './lib/fetchRepository';
import { lintProject } from './lib/linter';
import nhostClient from './lib/nhostClient';
import { StoredLinterResult } from './types/linter';

async function cleanup() {
  await fs.rm(CLONE_DIRECTORY, { recursive: true });

  console.info(`${chalk.blue`info:`} 🧹 Project cleanup successful.`);
  console.info('\nSee you later! 👋 ');
}

async function main({ logger, options }: ActionParameters) {
  const { owner, repo, base } = options;

  if (!owner || !repo) {
    logger.error(
      `Missing required options ${chalk.red('--owner')} and ${chalk.red(
        '--repo',
      )}`,
    );

    return;
  }

  logger.info(`🧙 Starting analysis (${ANALYSIS_ID})...`);

  let projectExists = false;
  let avatarUrl: string | null = null;
  let currentGitBranch: string | null = null;
  let currentGitCommitHash: string | null = null;

  const analyzableProjectPath = base
    ? `${CLONE_DIRECTORY}/${base.toString().replace(/^\//, '')}`
    : CLONE_DIRECTORY;

  try {
    await fs.readdir(CLONE_DIRECTORY);

    projectExists = true;
  } catch {
    logger.info(`📦 Cloning repository ${owner}/${repo}...`);
  }

  if (!projectExists) {
    try {
      const {
        html_url: htmlUrl,
        owner: { avatar_url: ownerAvatarUrl },
      } = await fetchRepository(owner.toString(), repo.toString());

      // Storing avatar URL for future use
      avatarUrl = ownerAvatarUrl;

      await executeCommand('git', ['clone', htmlUrl, CLONE_DIRECTORY]);

      const { stdout: gitBranchStdout, stderr: gitBranchStderr } =
        await executeCommand('git', ['branch', '--show-current'], {
          cwd: CLONE_DIRECTORY,
        });

      const [branch] = gitBranchStdout || gitBranchStderr;

      currentGitBranch = branch?.replace(/(\n)+/gi, '');

      const { stdout: commitHashStdout, stderr: commitHashStderr } =
        await executeCommand('git', ['rev-parse', '--short', 'HEAD'], {
          cwd: CLONE_DIRECTORY,
        });

      const [commitHash] = commitHashStdout || commitHashStderr;

      currentGitCommitHash = commitHash?.replace(/(\n)+/gi, '');
    } catch (error) {
      logger.error(
        `🚨 Failed to clone repository. Please check if you have access to the repository (${owner}/${repo}).`,
        error,
      );

      return;
    }
  }

  logger.info('🔍 Looking for problems...');

  try {
    const results = await lintProject(analyzableProjectPath);

    const {
      fatalErrorCount,
      errorCount,
      fixableErrorCount,
      warningCount,
      fixableWarningCount,
    } = results.reduce(
      (errorsAndWarnings, result) => ({
        ...errorsAndWarnings,
        fatalErrorCount:
          errorsAndWarnings.fatalErrorCount + result.fatalErrorCount,
        errorCount: errorsAndWarnings.errorCount + result.errorCount,
        fixableErrorCount:
          errorsAndWarnings.fixableErrorCount + result.fixableErrorCount,
        warningCount: errorsAndWarnings.warningCount + result.warningCount,
        fixableWarningCount:
          errorsAndWarnings.fixableWarningCount + result.fixableWarningCount,
      }),
      {
        fatalErrorCount: 0,
        errorCount: 0,
        fixableErrorCount: 0,
        warningCount: 0,
        fixableWarningCount: 0,
      },
    );

    if (errorCount === 0 && warningCount === 0) {
      logger.info('🎉 No linting errors found.');
    } else {
      logger.info(
        `${
          warningCount > errorCount ? '🟡' : '🔴'
        } ${errorCount} error(s) and ${warningCount} warning(s) found.`,
      );
    }

    const { data: saveRepositoryData, error: saveRepositoryError } =
      await nhostClient.graphql.request(
        gql`
          mutation SaveRepository($object: repositories_insert_input!) {
            insert_repositories_one(
              object: $object
              on_conflict: {
                constraint: repositories_owner_name_key
                update_columns: owner
              }
            ) {
              id
            }
          }
        `,
        {
          object: {
            owner,
            name: repo,
            avatar: avatarUrl,
          },
        },
      );

    if (saveRepositoryError) {
      logger.error('🚨 Failed to save repository.', saveRepositoryError);

      return;
    }

    const { error: saveAnalysisError } = await nhostClient.graphql.request(
      gql`
        mutation AddAnalysis($object: analyses_insert_input!) {
          insert_analyses_one(object: $object) {
            id
          }
        }
      `,
      {
        object: {
          id: ANALYSIS_ID,
          basePath: base,
          gitBranch: currentGitBranch,
          gitCommitHash: currentGitCommitHash,
          repositoryId: saveRepositoryData.insert_repositories_one.id,
          fatalErrorCount,
          errorCount,
          warningCount,
          fixableErrorCount,
          fixableWarningCount,
        },
      },
    );

    if (saveAnalysisError) {
      logger.error('🚨 Failed to save analysis.', saveAnalysisError);

      return;
    }

    const { data: saveLintingResultsData, error: saveLintingResultsError } =
      await nhostClient.graphql.request(
        gql`
          mutation AddLintingResults(
            $objects: [linting_results_insert_input!]!
          ) {
            insert_linting_results(objects: $objects) {
              affected_rows
            }
          }
        `,
        {
          objects: results.reduce((fileAnalysisResults, result) => {
            const ruleViolationsInFile: StoredLinterResult[] =
              result.messages.map(
                ({
                  ruleId,
                  severity,
                  line,
                  endLine,
                  column,
                  endColumn,
                  message,
                }) => ({
                  filePath: result.filePath,
                  ruleId,
                  severity,
                  line,
                  endLine,
                  column,
                  endColumn,
                  message,
                  analysisId: ANALYSIS_ID,
                }),
              );

            return [...fileAnalysisResults, ...ruleViolationsInFile];
          }, [] as StoredLinterResult[]),
        },
      );

    if (saveLintingResultsError) {
      logger.error(
        '🚨 Failed to save linting results.',
        saveLintingResultsError,
      );

      return;
    }

    if (saveLintingResultsData) {
      logger.info(
        `📝 ${saveLintingResultsData.insert_linting_results.affected_rows} linting result(s) saved to the database.`,
      );
    }
  } catch (error) {
    logger.error('🚨 Analysis failed or could not be performed.', error);
  }

  logger.info(`✨ Analysis (${ANALYSIS_ID}) finished.`);
}

program
  .option('-o, --owner <owner>', 'Repository owner')
  .option('-r, --repo <repository>', 'Repository to analyze')
  .option('-p, --base <basePath>', 'Base path of project to analyze')
  .option('-v, --verbose', 'Send internal command output to console')
  .action(main);

program.run().finally(cleanup);

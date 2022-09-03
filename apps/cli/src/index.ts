import type { ActionParameters } from '@caporal/core'
import { program } from '@caporal/core'
import chalk from 'chalk'
import { randomUUID } from 'crypto'
import 'dotenv/config'
import fs from 'fs/promises'
import gql from 'graphql-tag'
import { tmpdir } from 'os'
import executeCommand from './lib/executeCommand'
import fetchRepository from './lib/fetchRepository'
import { lintProject } from './lib/linter'
import { nhostClient } from './lib/nhostClient'

/**
 * Identifier of the analysis.
 */
export const ANALYSIS_ID = randomUUID().toUpperCase()

/**
 * Destination directory for the cloned repository.
 */
export const CLONE_DIRECTORY = `${tmpdir()}/sourcerer-${ANALYSIS_ID}`

async function cleanup() {
  await fs.rm(CLONE_DIRECTORY, { recursive: true })

  console.info(`${chalk.blue`info:`} 🧹 Project cleanup successful.`)
  console.info(`\nSee you later! 👋 `)
}

async function main({ logger, options }: ActionParameters) {
  const { owner, repo, base } = options

  if (!owner || !repo) {
    logger.error(
      `Missing required options ${chalk.red(`--owner`)} and ${chalk.red(
        `--repo`
      )}`
    )

    return
  }

  logger.info(`🧙 Starting analysis (${ANALYSIS_ID})...`)

  let projectExists = false
  let avatarUrl: string | null = null
  let currentGitBranch: string | null = null
  let currentGitCommitHash: string | null = null

  const analyzableProjectPath = base
    ? `${CLONE_DIRECTORY}/${base.toString().replace(/^\//, ``)}`
    : CLONE_DIRECTORY

  try {
    await fs.readdir(CLONE_DIRECTORY)

    projectExists = true
  } catch {
    logger.info(`📦 Cloning repository ${owner}/${repo}...`)
  }

  if (!projectExists) {
    try {
      const {
        html_url,
        owner: { avatar_url }
      } = await fetchRepository(owner.toString(), repo.toString())

      // Storing avatar URL for future use
      avatarUrl = avatar_url

      await executeCommand(`git`, [`clone`, html_url, CLONE_DIRECTORY])

      const { stdout: gitBranchStdout, stderr: gitBranchStderr } =
        await executeCommand(`git`, [`branch`, `--show-current`], {
          cwd: CLONE_DIRECTORY
        })

      const [branch] = gitBranchStdout || gitBranchStderr

      currentGitBranch = branch?.replace(/(\n)+/gi, ``)

      const { stdout: commitHashStdout, stderr: commitHashStderr } =
        await executeCommand(`git`, [`rev-parse`, `--short`, `HEAD`], {
          cwd: CLONE_DIRECTORY
        })

      const [commitHash] = commitHashStdout || commitHashStderr

      currentGitCommitHash = commitHash?.replace(/(\n)+/gi, ``)
    } catch (error) {
      logger.error(
        `🚨 Failed to clone repository. Please check if you have access to the repository (${owner}/${repo}).`,
        error
      )

      return
    }
  }

  logger.info(`🔍 Looking for problems...`)

  try {
    const results = await lintProject(analyzableProjectPath)

    const { totalErrorCount, totalWarningCount } = results.reduce(
      (errorsAndWarnings, result) => ({
        ...errorsAndWarnings,
        totalErrorCount: errorsAndWarnings.totalErrorCount + result.errorCount,
        totalWarningCount:
          errorsAndWarnings.totalWarningCount + result.warningCount
      }),
      { totalErrorCount: 0, totalWarningCount: 0 }
    )

    if (totalErrorCount === 0 && totalWarningCount === 0) {
      logger.info(`🎉 No linting errors found.`)
    } else {
      logger.info(
        `${
          totalWarningCount > totalErrorCount ? `🟡` : `🔴`
        } ${totalErrorCount} error(s) and ${totalWarningCount} warning(s) found.`
      )
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
            avatar: avatarUrl
          }
        }
      )

    if (saveRepositoryError) {
      logger.error(`🚨 Failed to save repository.`, saveRepositoryError)

      return
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
          repositoryId: saveRepositoryData.insert_repositories_one.id
        }
      }
    )

    if (saveAnalysisError) {
      logger.error(`🚨 Failed to save analysis.`, saveAnalysisError)

      return
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
          objects: results.map((result) => ({
            ...result,
            analysisId: ANALYSIS_ID
          }))
        }
      )

    if (saveLintingResultsError) {
      logger.error(
        `🚨 Failed to save linting results.`,
        saveLintingResultsError
      )

      return
    }

    if (saveLintingResultsData) {
      logger.info(
        `📝 ${saveLintingResultsData.insert_linting_results.affected_rows} linting result(s) saved to the database.`
      )
    }
  } catch (error) {
    logger.error(`🚨 Analysis failed or could not be performed.`, error)
  }

  logger.info(`✨ Analysis (${ANALYSIS_ID}) finished.`)
}

program
  .option(`-o, --owner <owner>`, `Repository owner`)
  .option(`-r, --repo <repository>`, `Repository to analyze`)
  .option(`-p, --base <basePath>`, `Base path of project to analyze`)
  .option(`-v, --verbose`, `Send internal command output to console`)
  .action(main)

program.run().finally(cleanup)

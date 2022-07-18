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
import { nhostClient } from './lib/nhost'

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
    } catch (error) {
      console.error(error)

      logger.error(
        `🚨 Failed to clone repository. Please check if you have access to the repository. (${owner}/${repo})`
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

    const { error: analysisError } = await nhostClient.graphql.request(
      gql`
        mutation AddAnalysis($object: analysis_insert_input!) {
          insert_analysis_one(object: $object) {
            id
            sourcererId
          }
        }
      `,
      {
        object: {
          sourcererId: ANALYSIS_ID,
          owner,
          repository: repo,
          base_path: base,
          avatar_url: avatarUrl
        }
      }
    )

    if (analysisError) {
      logger.error(`🚨 Failed to save analysis.`)

      return
    }

    const { data, error: linterResultsError } =
      await nhostClient.graphql.request(
        gql`
          mutation AddLinterResults($objects: [linter_results_insert_input!]!) {
            insert_linter_results(objects: $objects) {
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

    if (linterResultsError) {
      logger.error(`🚨 Failed to save linting results.`)

      return
    }

    if (data) {
      logger.info(
        `📝 ${data.insert_linter_results.affected_rows} linting result(s) saved to the database.`
      )
    }
  } catch (error) {
    logger.error(
      `🚨 Linting failed or could not be performed. Please check the output above.`
    )
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

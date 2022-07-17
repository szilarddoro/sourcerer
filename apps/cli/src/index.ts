import type { ActionParameters } from '@caporal/core'
import { program } from '@caporal/core'
import chalk from 'chalk'
import { randomUUID } from 'crypto'
import fs from 'fs/promises'
import { tmpdir } from 'os'
import executeCommand from './lib/executeCommand'
import fetchRepository from './lib/fetchRepository'
import { lintProject } from './lib/linter'

/**
 * Identifier of the analysis.
 */
const ANALYSIS_ID = randomUUID().toUpperCase()

/**
 * Destination directory for the cloned repository.
 */
const CLONE_DIRECTORY = `${tmpdir()}/sourcerer-${ANALYSIS_ID}`

async function cleanup() {
  await fs.rm(CLONE_DIRECTORY, { recursive: true })

  console.info(`${chalk.blue`info:`} 🧹 Project cleanup successful.`)
  console.info(`\nSee you later! 👋 `)
}

async function main({ logger, options }: ActionParameters) {
  const { owner, repo, base } = options

  logger.info(`🧙 Starting (${ANALYSIS_ID})...`)

  let projectExists = false

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
      const { html_url } = await fetchRepository(
        owner.toString(),
        repo.toString()
      )

      await executeCommand(`git`, [`clone`, html_url, CLONE_DIRECTORY])
    } catch (error) {
      logger.error(
        `🚨 Failed to clone repository. Please check if you have access to the repository. (${owner}/${repo})`
      )

      return
    }
  }

  logger.info(`🔍 Performing analysis...`)

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

    logger.info(
      `📝 ${totalErrorCount} error(s) and ${totalWarningCount} warning(s) found.`
    )

    // TODO: Process linter's results here
    // Send them to the server, etc.

    logger.info(`✨ Analysis results uploaded. (ID: ${ANALYSIS_ID})`)
  } catch (error) {
    logger.error(
      `🚨 Linting failed or could not be performed. Please check the output above.`
    )
  }
}

program
  .option(`-o, --owner <owner>`, `Repository owner`)
  .option(`-r, --repo, --repository <repository>`, `Repository to analyze`)
  .option(`-p, --base <basePath>`, `Base path of project to analyze`)
  .option(`-v, --verbose`, `Send internal command output to console`)
  .action(main)

program.run().finally(cleanup)

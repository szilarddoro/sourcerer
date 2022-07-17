import { ActionParameters, program } from '@caporal/core'
import chalk from 'chalk'
import { randomUUID } from 'crypto'
import fs from 'fs/promises'
import { tmpdir } from 'os'
import executeCommand, { ExecuteCommandReturnType } from './lib/executeCommand'
import fetchRepository from './lib/fetchRepository'

/**
 * Destination directory for the cloned repository.
 */
const CLONE_DIRECTORY = `${tmpdir()}/sourcerer-${randomUUID().toUpperCase()}`

function cleanup() {
  return fs.rm(CLONE_DIRECTORY, { recursive: true })
}

function processESLintOutput(output: string) {
  return output
    .split('\n')
    .filter(Boolean)
    .slice(1, -1)
    .map((outputLine) => {
      const [lineAndColumn, type, message, code] = outputLine
        .trim()
        .split(/\s\s+/)

      const [line, column] = lineAndColumn.split(':')

      return {
        location: { line: parseInt(line, 10), column: parseInt(column, 10) },
        type,
        message,
        code
      }
    })
}

async function runESLintCheck() {
  const files = await fs.readdir(CLONE_DIRECTORY, { withFileTypes: true })
  const hasTypeScriptConfiguration = files.some(
    (file) => file.isFile() && file.name === 'tsconfig.json'
  )

  // Note: By default we are treating project as a JavaScript project
  let config = 'configs/strict-javascript-eslintrc.json'

  if (hasTypeScriptConfiguration) {
    console.info(chalk.blue`📝 TypeScript configuration detected.`)

    config = 'configs/strict-typescript-eslintrc.json'
  }

  try {
    const { stdout } = await executeCommand('pnpm', [
      'eslint',
      '-c',
      config,
      `${CLONE_DIRECTORY}/**/*.{js,jsx,ts,tsx}`
    ])

    const errorsAndWarnings = processESLintOutput(stdout[0])

    console.log(errorsAndWarnings)
  } catch (output) {
    if (output instanceof Error) {
      console.error(chalk.red(output.message))

      return
    }

    const { stdout } = output as ExecuteCommandReturnType
    const errorsAndWarnings = processESLintOutput(stdout[0])

    console.log(errorsAndWarnings)
  }
}

async function main({ logger, options }: ActionParameters) {
  const { owner, repo } = options

  logger.info(`📦 Fetching repository ${owner}/${repo}...`)

  const { html_url } = await fetchRepository(owner.toString(), repo.toString())

  await executeCommand('git', ['clone', html_url, CLONE_DIRECTORY])

  logger.info(`🔍 Performing analysis...`)

  try {
    await runESLintCheck()
  } catch (error) {
    logger.error(`ESLint check returned errors. Please check the output above.`)
  }

  await cleanup()

  logger.info(`🧹 Analysis finished. Cleanup successful.`)
}

program
  .option('-o, --owner <owner>', 'Repository owner')
  .option('-r, --repo <repository>', 'Repository to analyze')
  .option('-v, --verbose', 'Send internal command output to console')
  .action(main)

program.run()

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

async function runESLintCheck(path: string = CLONE_DIRECTORY) {
  const files = await fs.readdir(path, { withFileTypes: true })

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
    const { stdout, stderr } = await executeCommand('pnpm', [
      'eslint',
      '-c',
      config,
      `${path}/**/*.{js,jsx,ts,tsx}`
    ])

    return processESLintOutput(stdout[0] || stderr[0])
  } catch (output) {
    if (output instanceof Error) {
      console.error(chalk.red(output.message))

      return
    }

    const { stdout, stderr } = output as ExecuteCommandReturnType

    return processESLintOutput(stdout[0] || stderr[0])
  }
}

async function main({ logger, options }: ActionParameters) {
  const { owner, repo, base } = options

  const analyzableProjectPath = base
    ? `${CLONE_DIRECTORY}/${base.toString().replace(/^\//, '')}`
    : CLONE_DIRECTORY

  logger.info(`📦 Cloning repository ${owner}/${repo}...`)

  try {
    const { html_url } = await fetchRepository(
      owner.toString(),
      repo.toString()
    )

    await executeCommand('git', ['clone', html_url, CLONE_DIRECTORY])
  } catch (error) {
    logger.error(
      `🚨 Failed to clone repository. Please check if you have access to the repository. (${owner}/${repo})`
    )

    return
  }

  logger.info(`🔍 Performing analysis...`)

  try {
    const result = await runESLintCheck(analyzableProjectPath)

    // TODO: Process ESLint check results here
    // Send them to the server, etc.
  } catch (error) {
    logger.error(
      `🚨 ESLint check failed or could not be performed. Please check the output above.`
    )
  }

  await cleanup()

  logger.info(`🧹 Analysis finished. Cleanup successful.`)
}

program
  .option('-o, --owner <owner>', 'Repository owner')
  .option('-r, --repo, --repository <repository>', 'Repository to analyze')
  .option('-p, --base <basePath>', 'Base path of project to analyze')
  .option('-v, --verbose', 'Send internal command output to console')
  .action(main)

program.run()

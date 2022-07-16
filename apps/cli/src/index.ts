import chalk from 'chalk'
import { randomUUID } from 'crypto'
import fs from 'fs/promises'
import { tmpdir } from 'os'
import executeCommand from './lib/executeCommand'
import fetchRepository from './lib/fetchRepository'

/**
 * Destination directory for the cloned repository.
 */
const CLONE_DIRECTORY = `${tmpdir()}/sourcerer-${randomUUID().toUpperCase()}`

async function cleanup() {
  await fs.rm(CLONE_DIRECTORY, { recursive: true })
}

async function runESLintCheck() {
  await executeCommand(
    'pnpm',
    'eslint',
    './src',
    '--quiet',
    '-c',
    'configs/strict-eslintrc.json'
  )
}

async function main() {
  try {
    await runESLintCheck()
  } catch (error) {
    console.error(`There were ESLint errors`)
  }

  return

  console.log(chalk.blue`Fetching repository details...`)

  const { html_url } = await fetchRepository('szilarddoro', 'svg-to-svgicon')

  await executeCommand('git', 'clone', html_url, CLONE_DIRECTORY)

  console.info(chalk.blue`Performing analysis...`)

  await cleanup()

  console.info(chalk.blue`Analysis finished.`)
}

main()

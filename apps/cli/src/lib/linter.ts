import chalk from 'chalk'
import fs from 'fs/promises'
import { CLONE_DIRECTORY } from '..'
import type { LinterResult, SimpleLinterResult } from '../types/linter'
import executeCommand from './executeCommand'

/**
 * Maps the linter command's output to an array of objects representing the
 * results.
 *
 * @param lintCommandOutput - The output of the linter.
 * @returns An array of objects representing the linter's results.
 */
export function mapLinterResults(
  lintCommandOutput?: string
): SimpleLinterResult[] {
  if (!lintCommandOutput) {
    return []
  }

  const results = JSON.parse(lintCommandOutput) as LinterResult[]

  return results
    .filter((result) => result.errorCount > 0 || result.warningCount > 0)
    .map(({ source: _source, filePath, ...result }) => ({
      ...result,
      filePath: filePath.replace(CLONE_DIRECTORY, ``)
    }))
}

/**
 * Runs the linter on the specified project and returns the results.
 *
 * @param path - Path to project to run linter on.
 * @returns Results of the linter.
 */
export async function lintProject(path: string) {
  const files = await fs.readdir(path, { withFileTypes: true })

  const hasTypeScriptConfiguration = files.some(
    (file) => file.isFile() && file.name === `tsconfig.json`
  )

  // Note: By default we are treating project as a JavaScript project
  let config = `configs/strict-javascript-eslintrc.json`

  if (hasTypeScriptConfiguration) {
    console.info(chalk.blue`info:`, `📝 TypeScript configuration detected.`)

    config = `configs/strict-typescript-eslintrc.json`
  }

  // TODO: Take .eslintignore into account
  // TODO: Take the project's ESLint configuration into account - override rules
  // with Sourcerer's strict ESLint rules

  const { stdout, stderr } = await executeCommand(`pnpm`, [
    `eslint`,
    `--no-eslintrc`,
    `-c`,
    config,
    `--format`,
    `json`,
    `${path}/**/*.{js,jsx,ts,tsx}`
  ])

  return mapLinterResults(stdout.join(``) || stderr.join(``))
}

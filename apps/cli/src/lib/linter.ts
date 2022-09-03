import chalk from 'chalk';
import fs from 'fs/promises';
import type { LinterResult, SimpleLinterResult } from '../types/linter';
import { CLONE_DIRECTORY } from './constants';
import executeCommand from './executeCommand';

/**
 * Maps the linter command's output to an array of objects representing the
 * results.
 *
 * @param lintCommandOutput - The output of the linter.
 * @returns An array of objects representing the linter's results.
 */
export function mapLinterResults(
  lintCommandOutput?: string,
): SimpleLinterResult[] {
  if (!lintCommandOutput) {
    return [];
  }

  try {
    const results = JSON.parse(lintCommandOutput) as LinterResult[];

    return results
      .filter((result) => result.errorCount > 0 || result.warningCount > 0)
      .map(({ source: _source, filePath, ...result }) => ({
        ...result,
        filePath: filePath.replace(CLONE_DIRECTORY, ''),
      }));
  } catch (error) {
    console.error(
      chalk.red`error:`,
      error && error instanceof Error ? error.message : error,
    );
  }

  return [];
}

/**
 * Runs the linter on the specified project and returns the results.
 *
 * @param path - Path to project to run linter on.
 * @returns Results of the linter.
 */
export async function lintProject(path: string) {
  let isReactProject = false;

  try {
    const { dependencies, peerDependencies } = JSON.parse(
      await fs.readFile(`${path}/package.json`, {
        encoding: 'utf-8',
      }),
    );

    isReactProject = Boolean(dependencies?.react || peerDependencies?.react);
  } catch (error) {
    console.error(chalk.red`error:`, '🚨 Failed to read package.json.', error);
  }

  let esLintConfigurationAvailable = false;

  const files = await fs.readdir(path, { withFileTypes: true });

  const hasESLintFileInRoot = files.some(
    (file) => file.isFile() && file.name.startsWith('.eslintrc'),
  );

  if (hasESLintFileInRoot) {
    esLintConfigurationAvailable = true;
  } else {
    const isPackageAvailable = files.some(
      (file) => file.isFile() && file.name === 'package.json',
    );

    if (isPackageAvailable) {
      const packageJsonBuffer = await fs.readFile(`${path}/package.json`, {
        encoding: 'utf-8',
      });

      const { eslintConfig } = JSON.parse(packageJsonBuffer.toString());

      if (eslintConfig) {
        esLintConfigurationAvailable = true;
      }
    }
  }

  if (esLintConfigurationAvailable) {
    // TODO: Install dependencies in this case and use the project's ESLint
    // configuration, skip using AirBnb's configuration.
    console.info(chalk.blue`info:`, '📝 ESLint configuration detected.');
  }

  const hasTypeScriptConfiguration = files.some(
    (file) => file.isFile() && file.name === 'tsconfig.json',
  );

  let config = hasTypeScriptConfiguration
    ? 'configs/typescript-eslintrc.json'
    : 'configs/javascript-eslintrc.json';

  if (isReactProject) {
    config = hasTypeScriptConfiguration
      ? 'configs/react-typescript-eslintrc.json'
      : 'configs/react-javascript-eslintrc.json';
  }

  console.info(
    chalk.blue`info:`,
    `📝 Using ${config} based on the detected project setup.`,
  );

  // TODO: Take .eslintignore into account
  // TODO: Take the project's ESLint configuration into account - override rules
  // with Sourcerer's strict ESLint rules

  const { stdout, stderr } = await executeCommand(
    'pnpm',
    [
      'eslint',
      '--no-eslintrc',
      '--config',
      config,
      hasTypeScriptConfiguration ? '--parser-options' : null,
      hasTypeScriptConfiguration ? `project:${path}/tsconfig.json` : null,
      '--format',
      'json',
      `${path}`,
      '--ext',
      '.ts,.tsx,.js,.jsx',
    ].filter(Boolean) as string[],
  );

  return mapLinterResults(stdout.join('') || stderr.join(''));
}

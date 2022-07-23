import chalk from 'chalk'
import { spawn } from 'child_process'

export interface ExecuteCommandReturnType {
  code: number | null
  errors: Error[]
  stdout: string[]
  stderr: string[]
}

export default async function executeCommand(
  command: string,
  args: readonly string[],
  options: { verbose?: boolean; cwd?: string } = {
    verbose: false,
    cwd: process.cwd()
  }
) {
  return new Promise<ExecuteCommandReturnType>((resolve) => {
    const spawnedCommand = spawn(command, args, { cwd: options.cwd })

    let errors: Error[] = []
    let stderr: string[] = []
    let stdout: string[] = []

    spawnedCommand.on(`error`, (error) => {
      if (error.message && options.verbose) {
        console.error(chalk.red(error.message))
      }
    })

    spawnedCommand.stdout.on(`error`, (error) => {
      errors = errors.concat(error)

      if (error.message && options.verbose) {
        console.error(chalk.red(error.message))
      }
    })

    spawnedCommand.stderr.on(`error`, (error) => {
      errors = errors.concat(error)

      if (error.message && options.verbose) {
        console.error(chalk.red(error.message))
      }
    })

    spawnedCommand.stdout.on(`data`, (data) => {
      const output = data.toString()

      stdout = stdout.concat(output)

      if (output && options.verbose) {
        console.info(chalk.blue(output))
      }
    })

    spawnedCommand.stderr.on(`data`, (data) => {
      const output = data.toString()

      stderr = stderr.concat(output)

      if (output && options.verbose) {
        console.info(chalk.blue(output))
      }
    })

    spawnedCommand.on(`close`, (code) => {
      resolve({
        code,
        errors,
        stdout,
        stderr
      } as ExecuteCommandReturnType)
    })
  })
}

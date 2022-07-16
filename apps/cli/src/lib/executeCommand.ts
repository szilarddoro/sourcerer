import chalk from 'chalk'
import { spawn } from 'child_process'

export default async function executeCommand(
  command: string,
  ...args: readonly string[]
) {
  return new Promise<number>((resolve, reject) => {
    const clone = spawn(command, args)

    clone.on('error', (error) => {
      console.error(chalk.red(error))
    })

    clone.stdout.on('data', (data) => {
      console.info(data.toString())
    })

    clone.stderr.on('data', (data) => {
      console.error(data.toString())
    })

    clone.on('close', (code) => {
      if (code === 0) {
        return resolve(0)
      }

      return reject(code)
    })
  })
}

import chalk from 'chalk'
import fs from 'fs/promises'
import executeCommand from './executeCommand'

export default async function installDependencies(path: string) {
  const files = await fs.readdir(path, { withFileTypes: true })

  const isUsingNpm = files.some(
    (file) => file.isFile() && file.name === `package-lock.json`
  )

  const getMessage = (packageManager: string, command: string) =>
    `📦 ${packageManager} was detected. Installing dependencies using: ${command}`

  if (isUsingNpm) {
    console.info(chalk.blue`info:`, getMessage(`npm`, `npm ci`))

    await executeCommand(`npm`, [`ci`], { cwd: path })

    return
  }

  const isUsingYarn = files.some(
    (file) => file.isFile() && file.name === `yarn.lock`
  )

  if (isUsingYarn) {
    console.info(
      chalk.blue`info:`,
      getMessage(`yarn`, `yarn install --frozen-lockfile`)
    )

    await executeCommand(`yarn`, [`install`, `--frozen-lockfile`], {
      cwd: path
    })

    return
  }

  const isUsingPnpm = files.some(
    (file) => file.isFile() && file.name === `pnpm-lock.yaml`
  )

  if (isUsingPnpm) {
    console.info(
      chalk.blue`info:`,
      getMessage(`pnpm`, `pnpm install --frozen-lockfile`)
    )

    await executeCommand(`pnpm`, [`install`, `--frozen-lockfile`], {
      cwd: path
    })

    return
  }
}

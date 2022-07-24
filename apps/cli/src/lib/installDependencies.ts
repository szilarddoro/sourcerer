import chalk from 'chalk'
import fs from 'fs/promises'
import executeCommand from './executeCommand'

export default async function installDependencies(path: string) {
  const files = await fs.readdir(path, { withFileTypes: true })

  const isUsingNpm = files.some(
    (file) => file.isFile() && file.name === `package-lock.json`
  )

  if (isUsingNpm) {
    console.info(chalk.blue`info:`, `📝 NPM lock file detected.`)

    await executeCommand(`yarn`, [`ci`], { cwd: path })

    return
  }

  const isUsingYarn = files.some(
    (file) => file.isFile() && file.name === `yarn.lock`
  )

  if (isUsingYarn) {
    console.info(chalk.blue`info:`, `📝 Yarn lock file detected.`)

    await executeCommand(`yarn`, [`install`, `--frozen-lockfile`], {
      cwd: path
    })

    return
  }

  const isUsingPnpm = files.some(
    (file) => file.isFile() && file.name === `pnpm-lock.yaml`
  )

  if (isUsingPnpm) {
    console.info(chalk.blue`info:`, `📝 PNPM lock file detected.`)

    await executeCommand(`pnpm`, [`install`, `--frozen-lockfile`], {
      cwd: path
    })

    return
  }
}

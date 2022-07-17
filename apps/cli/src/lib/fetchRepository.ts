import fetch from 'cross-fetch'

export default async function fetchRepository(
  owner: string,
  repository: string
) {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repository}`,
    {
      headers: {
        [`Authorization`]: `token ${process.env.GITHUB_ACCESS_TOKEN}`
      }
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || `Unknown error occurred`)
  }

  return data
}

export default async function fetchRepoDetails({
  owner,
  repository
}: {
  owner: string
  repository: string
}) {
  if (!owner || !repository) {
    return {}
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repository}`
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Unknown error occurred')
    }

    return data
  } catch (error) {
    throw error
  }
}

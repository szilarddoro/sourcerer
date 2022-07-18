export default async function fetchOrganizationDetails({
  owner
}: {
  owner: string
}) {
  if (!owner) {
    throw new Error('owner is required')
  }

  const response = await fetch(`https://api.github.com/users/${owner}`)
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Unknown error occurred')
  }

  return data
}

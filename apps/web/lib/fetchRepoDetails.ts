import { QueryFunctionContext } from 'react-query'
import { AnalyzeFormData } from '../pages'

export default async function fetchRepoDetails(
  params: QueryFunctionContext<(string | AnalyzeFormData)[]>
) {
  const [, variables] = params.queryKey

  if (
    typeof variables !== 'object' ||
    !variables.owner ||
    !variables.repository
  ) {
    return {}
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${variables.owner}/${variables.repository}`
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

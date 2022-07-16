import Head from 'next/head'
import { useRouter } from 'next/router'
import { useQuery } from 'react-query'
import fetchRepoDetails from '../../../lib/fetchRepoDetails'

export default function GitHubRepoAnalysisPage() {
  const router = useRouter()

  const owner =
    router.query && router.query.owner
      ? (router.query.owner as string).toLowerCase()
      : ''
  const repository =
    router.query && router.query.repository
      ? (router.query.repository as string).toLowerCase()
      : ''

  const { error } = useQuery(
    ['repos', { owner, repository }],
    fetchRepoDetails,
    { retry: 0, refetchOnWindowFocus: false }
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 grid grid-flow-row gap-6">
      <Head>
        <title>
          {owner}/{repository}
        </title>
      </Head>

      {error && (
        <p className="rounded-md bg-red-100 text-red-500 p-3 text-sm font-medium">
          Error: {(error as Error).message || 'Unknown error occurred.'}
        </p>
      )}
    </div>
  )
}

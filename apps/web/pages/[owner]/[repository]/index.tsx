import gql from 'graphql-tag'
import { NextPageContext } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Analysis from '../../../components/display/Analysis'
import fetchRepoDetails from '../../../lib/fetchRepoDetails'
import { nhostClient } from '../../_app'

export interface GitHubAnalysisPageProps {
  data: any[]
  avatar: string
  error?: any
}

export default function GitHubAnalysisPage({
  data,
  avatar,
  error
}: GitHubAnalysisPageProps) {
  const {
    query: { owner, repository }
  } = useRouter()

  return (
    <div className="grid max-w-5xl grid-flow-row gap-6 px-4 py-6 mx-auto">
      <Head>
        {owner && repository ? (
          <title>
            {owner}/{repository} - Sourcerer
          </title>
        ) : (
          <title>Sourcerer</title>
        )}
      </Head>

      <h1 className="grid items-center justify-start grid-flow-col gap-3 text-2xl font-bold">
        {avatar ? (
          <img
            src={avatar}
            alt={`Avatar of ${owner}/${repository}`}
            className="overflow-hidden rounded-lg w-11 h-11"
          />
        ) : (
          <div className="overflow-hidden rounded-lg w-11 h-11 bg-slate-300" />
        )}

        <span>
          {owner}/{repository}
        </span>
      </h1>

      <div className="grid grid-flow-row gap-4">
        {data.length === 0 ? (
          <p>No analysis results found.</p>
        ) : (
          data.map((row) => <Analysis data={row} key={row.id} />)
        )}
      </div>
    </div>
  )
}

export async function getServerSideProps(context: NextPageContext) {
  const { owner, repository } = context.query
  const { data, error } = await nhostClient.graphql.request(
    gql`
      query GetAnalysisList($owner: String!, $repository: String!) {
        analysis(
          order_by: { updated_at: desc }
          where: { owner: { _eq: $owner }, repository: { _eq: $repository } }
        ) {
          id
          owner
          repository
          base_path
          created_at
          updated_at
          linter_results {
            id
            filePath
            errorCount
            warningCount
          }
        }
      }
    `,
    { owner, repository }
  )

  if (error) {
    return {
      props: { error, data: [] }
    }
  }

  try {
    const {
      owner: { avatar_url }
    } = await fetchRepoDetails({
      owner: owner as string,
      repository: repository as string
    })

    return { props: { data: data.analysis, avatar: avatar_url } }
  } catch {}

  return {
    props: { data: data.analysis }
  }
}

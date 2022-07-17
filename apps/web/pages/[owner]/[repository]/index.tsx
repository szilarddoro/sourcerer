import gql from 'graphql-tag'
import { NextPageContext } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { nhostClient } from '../../_app'

export interface GitHubAnalysisPageProps {
  data: any[]
  error?: any
}

export default function GitHubAnalysisPage({
  data,
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
            {owner}/{repository}
          </title>
        ) : (
          <title>Sourcerer</title>
        )}
      </Head>

      <h1 className="text-3xl font-bold text-slate-900">
        {owner}/{repository}
      </h1>

      <div>
        {data.length === 0 ? (
          <p>No analysis results found.</p>
        ) : (
          data.map(({ id, linter_results }) => (
            <ul key={id}>
              {linter_results.map(
                ({ id, filePath, errorCount, warningCount }: any) => (
                  <li key={id}>
                    {filePath} - Errors: {errorCount} - Warnings: {warningCount}
                  </li>
                )
              )}
            </ul>
          ))
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
          where: { owner: { _eq: $owner }, repository: { _eq: $repository } }
        ) {
          id
          owner
          repository
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

  return {
    props: { data: data.analysis }
  }
}

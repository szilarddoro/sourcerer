import gql from 'graphql-tag'
import { NextPageContext } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Analysis from '../../../components/display/Analysis'
import Container from '../../../components/ui/Container'
import Heading from '../../../components/ui/Heading'
import Layout from '../../../components/ui/Layout'
import { nhostClient } from '../../../lib/nhostClient'

export interface RepositoryDetailsPageProps {
  data: any[]
  avatar_url?: string
}

export default function RepositoryDetailsPage({
  data = [],
  avatar_url
}: RepositoryDetailsPageProps) {
  const {
    query: { owner, repository }
  } = useRouter()

  return (
    <Layout title={owner && repository ? `${owner}/${repository}` : ``}>
      <Container>
        <Heading className="grid items-center justify-start grid-flow-col gap-3">
          {avatar_url ? (
            <img
              src={avatar_url}
              alt={`Avatar of ${owner}`}
              className="overflow-hidden rounded-lg w-11 h-11"
            />
          ) : (
            <div className="overflow-hidden rounded-lg w-11 h-11 bg-slate-300" />
          )}

          <span className="inline-grid grid-flow-col gap-2">
            <Link href={`/${owner}`} passHref>
              <a className="dark:hover:text-blue-400 hover:text-blue-600 motion-safe:transition-colors">
                {owner}
              </a>
            </Link>
            <span className="font-normal opacity-30">/</span>
            <Link href={`/${owner}/${repository}`} passHref>
              <a className="dark:hover:text-blue-400 hover:text-blue-600 motion-safe:transition-colors">
                {repository}
              </a>
            </Link>
          </span>
        </Heading>

        <div className="grid grid-flow-row gap-5">
          {data.length === 0 ? (
            <p>No analysis results found.</p>
          ) : (
            data.map((row) => <Analysis data={row} key={row.id} />)
          )}
        </div>
      </Container>
    </Layout>
  )
}

export async function getServerSideProps(context: NextPageContext) {
  const { owner, repository } = context.query
  const { data, error } = await nhostClient.graphql.request(
    gql`
      query GetAnalysisList($owner: String!, $repository: String!) {
        avatar_urls: analysis(
          where: { owner: { _eq: $owner } }
          distinct_on: avatar_url
        ) {
          avatar_url
        }
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
          linter_results_aggregate {
            aggregate {
              sum {
                errorCount
                fatalErrorCount
                fixableErrorCount
                fixableWarningCount
                warningCount
              }
            }
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

  if (!data) {
    return { props: {} }
  }

  return {
    props: {
      data: data.analysis || [],
      avatar_url: data.avatar_urls[0]?.avatar_url || null
    }
  }
}

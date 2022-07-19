import gql from 'graphql-tag'
import { NextPageContext } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Analysis from '../../../components/display/Analysis'
import Container from '../../../components/ui/Container'
import Heading from '../../../components/ui/Heading'
import Layout from '../../../components/ui/Layout'
import { nhostClient } from '../../../lib/nhostClient'
import type { RepositoryData } from '../../../types/repositories'

export interface RepositoryDetailsPageProps {
  data: RepositoryData
}

export default function RepositoryDetailsPage({
  data
}: RepositoryDetailsPageProps) {
  const {
    query: { owner, repository }
  } = useRouter()

  return (
    <Layout title={owner && repository ? `${owner}/${repository}` : ``}>
      <Container>
        <Heading
          component="h1"
          variant="h2"
          className="grid items-center justify-start grid-flow-col gap-3"
        >
          {data?.avatar ? (
            <img
              src={data?.avatar}
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
          {data?.analyses.length === 0 ? (
            <p>No analysis results found.</p>
          ) : (
            data?.analyses.map((analysis: any) => (
              <Analysis
                owner={owner as string}
                repository={repository as string}
                data={analysis}
                key={analysis.id}
              />
            ))
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
      query GetAnalyses($owner: String!, $repository: String!) {
        repository: repositories_by_pk(owner: $owner, name: $repository) {
          id
          owner
          name
          avatar
          analyses(order_by: { updatedAt: desc }) {
            id
            createdAt
            updatedAt
            basePath
            lintingResultsAggregate: linting_results_aggregate {
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
      }
    `,
    { owner, repository }
  )

  if (error) {
    return {
      props: { error, repository: null }
    }
  }

  if (!data) {
    return { props: { repository: null } }
  }

  return {
    props: {
      data: data.repository || null
    }
  }
}

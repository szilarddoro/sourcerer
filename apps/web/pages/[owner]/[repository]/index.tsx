import gql from 'graphql-tag'
import { NextPageContext } from 'next'
import { useRouter } from 'next/router'
import Analysis from '../../../components/display/Analysis'
import Container from '../../../components/ui/Container'
import Heading from '../../../components/ui/Heading'
import Layout from '../../../components/ui/Layout'
import Link from '../../../components/ui/Link'
import { nhostClient } from '../../../lib/nhostClient'
import type { RepositoryData } from '../../../types/repositories'

export interface RepositoryDetailsPageProps {
  data: RepositoryData
  notFound?: boolean
}

export default function RepositoryDetailsPage({
  data,
  notFound
}: RepositoryDetailsPageProps) {
  const {
    query: { owner, repository }
  } = useRouter()

  if (!data || notFound) {
    return (
      <Layout>
        <Container className="justify-items-start">
          <Heading>Not Found</Heading>

          <p>This repository does not exist.</p>

          <Link href="/" className="text-sm text-blue-500 dark:text-blue-300">
            Go back to home page
          </Link>
        </Container>
      </Layout>
    )
  }

  return (
    <Layout title={owner && repository ? `${owner}/${repository}` : ``}>
      <Container>
        <Heading
          component="h1"
          variant="h2"
          className="grid items-center justify-start grid-flow-col gap-3"
        >
          {data.avatar ? (
            <img
              src={data.avatar}
              alt={`Avatar of ${owner}`}
              className="overflow-hidden rounded-lg w-11 h-11"
            />
          ) : (
            <div className="overflow-hidden rounded-lg w-11 h-11 bg-slate-300" />
          )}

          <span className="inline-grid grid-flow-col gap-2">
            <Link href={`/${owner}`} className="text-inherit">
              {owner}
            </Link>

            <span className="font-normal opacity-30">/</span>

            <Link href={`/${owner}/${repository}`} className="text-inherit">
              {repository}
            </Link>
          </span>
        </Heading>

        <div className="grid grid-flow-row gap-5">
          {data.analyses.length === 0 ? (
            <p className="text-slate-500">No analysis results found.</p>
          ) : (
            data.analyses.map((analysis) => (
              <Link
                href={`/${owner}/${repository}/${analysis.id}`}
                key={analysis.id}
              >
                <Analysis
                  owner={owner as string}
                  repository={repository as string}
                  data={analysis}
                />
              </Link>
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

  if (data && !data.repository) {
    return { props: { repository: null, notFound: true } }
  }

  return {
    props: {
      data: data.repository || null
    }
  }
}

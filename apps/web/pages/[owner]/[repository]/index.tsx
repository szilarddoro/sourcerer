import gql from 'graphql-tag'
import { NextPageContext } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Analysis from '../../../components/display/Analysis'
import Container from '../../../components/ui/Container'
import Heading from '../../../components/ui/Heading'
import Layout from '../../../components/ui/Layout'
import fetchOrganizationDetails from '../../../lib/fetchOrganizationDetails'
import { nhostClient } from '../../../lib/nhostClient'

export interface RepositoryDetailsPageProps {
  data: any[]
  organization?: any
}

export default function RepositoryDetailsPage({
  data = [],
  organization: { avatar_url } = {}
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

          <span>
            <Link href={`/${owner}`} passHref>
              <a className="hover:underline">{owner}</a>
            </Link>
            /
            <Link href={`/${owner}/${repository}`} passHref>
              <a className="hover:underline">{repository}</a>
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

  try {
    const organization = await fetchOrganizationDetails({
      owner: owner as string
    })

    return { props: { data: data.analysis || [], organization } }
  } catch (error) {
    console.error(error)
    return {
      props: {
        error: 'Unknown error while fetching organization details.',
        data: data.analysis || []
      }
    }
  }
}

import gql from 'graphql-tag'
import { NextPageContext } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Card from '../../components/ui/Card'
import Chip from '../../components/ui/Chip'
import Container from '../../components/ui/Container'
import Heading from '../../components/ui/Heading'
import Layout from '../../components/ui/Layout'
import { nhostClient } from '../../lib/nhostClient'

export interface OwnerDetailsPageProps {
  distinctRepositories: { id: string; owner: string; repository: string }[]
  avatar_url?: any
}

export default function OwnerDetailsPage({
  distinctRepositories,
  avatar_url
}: OwnerDetailsPageProps) {
  const {
    query: { owner }
  } = useRouter()

  return (
    <Layout title={(owner as string) || ''}>
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

          {owner}
        </Heading>

        <div className="grid grid-cols-4 gap-4">
          {distinctRepositories.map(({ owner, repository }) => (
            <Link href={`/${owner}/${repository}`} passHref key={repository}>
              <a>
                <Card
                  action
                  className="grid grid-flow-row col-span-1 gap-2 justify-items-start"
                >
                  <strong className="text-lg">{repository}</strong>

                  <Chip>n/a</Chip>
                </Card>
              </a>
            </Link>
          ))}
        </div>
      </Container>
    </Layout>
  )
}

export async function getServerSideProps(context: NextPageContext) {
  const { owner } = context.query
  const { data, error } = await nhostClient.graphql.request(
    gql`
      query GetProjectOwners($owner: String!) {
        avatar_urls: analysis(
          where: { owner: { _eq: $owner } }
          distinct_on: avatar_url
        ) {
          avatar_url
        }
        distinctRepositories: analysis(
          distinct_on: repository
          where: { owner: { _eq: $owner } }
        ) {
          id
          owner
          repository
        }
      }
    `,
    { owner }
  )

  if (error) {
    return { props: { error } }
  }

  if (!data) {
    return { props: {} }
  }

  return {
    props: {
      distinctRepositories: data.distinctRepositories,
      avatar_url: data.avatar_urls[0]?.avatar_url
    }
  }
}

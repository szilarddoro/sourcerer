import gql from 'graphql-tag'
import Link from 'next/link'
import Card from '../components/ui/Card'
import Chip from '../components/ui/Chip'
import Container from '../components/ui/Container'
import Heading from '../components/ui/Heading'
import Layout from '../components/ui/Layout'
import { nhostClient } from '../lib/nhostClient'

export interface IndexPageProps {
  distinctRepositories: {
    id: string
    owner: string
    repository: string
    avatar_url: string
  }[]
}

export default function IndexPage({ distinctRepositories }: IndexPageProps) {
  // TODO: Move this logic to GraphQL queries
  const distinctReposByOwner = (distinctRepositories || []).reduce(
    (reposByOwner, { owner, repository, avatar_url }) => {
      if (reposByOwner.has(owner)) {
        return reposByOwner.set(owner, {
          avatar_url,
          repositories: [
            ...(reposByOwner.get(owner)?.repositories || []),
            repository
          ]
        })
      }

      return reposByOwner.set(owner, { repositories: [repository], avatar_url })
    },
    new Map<string, { repositories: string[]; avatar_url: string }>()
  )

  const distinctOwners = Array.from(distinctReposByOwner.keys())

  return (
    <Layout title="Home">
      <Container className="gap-4">
        <Heading variant="h1">Browse</Heading>

        <div className="grid grid-cols-4 gap-4">
          {distinctOwners.map((owner) => {
            const data = distinctReposByOwner.get(owner)

            if (!data) {
              return null
            }

            return (
              <Link href={`/${owner}`} passHref key={owner}>
                <a>
                  <Card
                    action
                    className="grid grid-flow-row col-span-1 gap-2 justify-items-start"
                  >
                    {data.avatar_url ? (
                      <img
                        src={data.avatar_url}
                        alt={`Avatar of ${owner}`}
                        className="overflow-hidden rounded-lg w-11 h-11"
                      />
                    ) : (
                      <div className="overflow-hidden rounded-lg w-11 h-11 bg-slate-300" />
                    )}

                    <strong className="text-lg">{owner}</strong>

                    <Chip>{data.repositories.length} projects</Chip>
                  </Card>
                </a>
              </Link>
            )
          })}
        </div>
      </Container>
    </Layout>
  )
}

export async function getServerSideProps() {
  const { data, error } = await nhostClient.graphql.request(
    gql`
      query GetProjectOwners {
        distinctRepositories: analysis(distinct_on: repository) {
          id
          owner
          repository
          avatar_url
        }
      }
    `
  )

  console.log(error)

  if (error) {
    return { props: { error } }
  }

  if (data) {
    return {
      props: {
        distinctRepositories: data.distinctRepositories || []
      }
    }
  }

  return { props: {} }
}

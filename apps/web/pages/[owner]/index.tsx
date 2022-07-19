import gql from 'graphql-tag'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Card from '../../components/ui/Card'
import Chip from '../../components/ui/Chip'
import Container from '../../components/ui/Container'
import Heading from '../../components/ui/Heading'
import Layout from '../../components/ui/Layout'
import { nhostClient } from '../../lib/nhostClient'
import { RepositoryData } from '../../types/repositories'

export interface OwnerDetailsPageProps {
  data: RepositoryData[]
  avatar?: string
}

export default function OwnerDetailsPage({
  data,
  avatar
}: OwnerDetailsPageProps) {
  const { t } = useTranslation('common')
  const {
    query: { owner }
  } = useRouter()

  return (
    <Layout title={(owner as string) || ''}>
      <Container>
        <Heading
          component="h1"
          variant="h2"
          className="grid items-center justify-start grid-flow-col gap-3"
        >
          {avatar ? (
            <img
              src={avatar}
              alt={`Avatar of ${owner}`}
              className="overflow-hidden rounded-lg w-11 h-11"
            />
          ) : (
            <div className="overflow-hidden rounded-lg w-11 h-11 bg-slate-300" />
          )}

          <Link href={`/${owner}`} passHref>
            <a className="dark:hover:text-blue-400 hover:text-blue-600 motion-safe:transition-colors">
              {owner}
            </a>
          </Link>
        </Heading>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {data.map(({ id, owner, name, analysesAggregate }) => (
            <Link href={`/${owner}/${name}`} passHref key={id}>
              <a>
                <Card
                  action
                  className="grid grid-flow-row col-span-1 gap-2 justify-items-start"
                >
                  <strong className="text-lg">{name}</strong>

                  <Chip>
                    {t('analysis', {
                      count: analysesAggregate.aggregate.count
                    })}
                  </Chip>
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
      query GetRepositories($owner: String!) {
        repositories(where: { owner: { _eq: $owner } }) {
          id
          owner
          name
          avatar
          analysesAggregate: analyses_aggregate {
            aggregate {
              count
            }
          }
        }
        avatarUrls: repositories(
          where: { owner: { _eq: $owner } }
          distinct_on: avatar
        ) {
          avatar
        }
      }
    `,
    { owner }
  )

  if (error) {
    return { props: { error, data: [] } }
  }

  if (!data) {
    return { props: { data: [] } }
  }

  return {
    props: {
      avatar: data.avatarUrls[0]?.avatar || null,
      data: data.repositories || []
    }
  }
}

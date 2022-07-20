import gql from 'graphql-tag'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import Card from '../../components/ui/Card'
import Chip from '../../components/ui/Chip'
import Container from '../../components/ui/Container'
import Heading from '../../components/ui/Heading'
import Layout from '../../components/ui/Layout'
import Link from '../../components/ui/Link'
import { nhostClient } from '../../lib/nhostClient'
import { RepositoryData } from '../../types/repositories'

export interface OwnerDetailsPageProps {
  data: RepositoryData[]
  avatar?: string
  notFound?: boolean
}

export default function OwnerDetailsPage({
  data,
  avatar,
  notFound
}: OwnerDetailsPageProps) {
  const { t } = useTranslation('common')
  const {
    query: { owner }
  } = useRouter()

  if (!data || notFound) {
    return (
      <Layout>
        <Container className="justify-items-start">
          <Heading>Not Found</Heading>

          <p>This owner does not exist.</p>

          <Link href="/" className="text-sm text-blue-500 dark:text-blue-300">
            Go back to home page
          </Link>
        </Container>
      </Layout>
    )
  }

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

          <Link href={`/${owner}`} className="text-inherit">
            {owner}
          </Link>
        </Heading>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {data.map(({ id, owner, name, analysesAggregate }) => (
            <Link href={`/${owner}/${name}`} key={id} className="text-inherit">
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
        repositories(
          where: { owner: { _eq: $owner } }
          order_by: { name: asc }
        ) {
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

  if (data && data.repositories.length === 0) {
    return { props: { data: [], notFound: true } }
  }

  return {
    props: {
      avatar: data.avatarUrls[0]?.avatar || null,
      data: data.repositories || []
    }
  }
}

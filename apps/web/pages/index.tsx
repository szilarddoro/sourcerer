import gql from 'graphql-tag'
import Container from '../components/ui/Container'
import Heading from '../components/ui/Heading'
import Layout from '../components/ui/Layout'
import { nhostClient } from '../lib/nhostClient'

export interface IndexPageProps {
  projectOwners: { id: string; owner: string }[]
}

export default function IndexPage({ projectOwners }: IndexPageProps) {
  console.log(projectOwners)

  return (
    <Layout title="Home">
      <Container>
        <Heading variant="h1">Projects</Heading>

        <div className="grid grid-cols-4 gap-4">
          {projectOwners.map(({ id, owner }) => (
            <div
              className="col-span-1 p-4 border-2 rounded-md dark:border-white dark:border-opacity-5 border-slate-200"
              key={id}
            >
              <strong>{owner}</strong>
            </div>
          ))}
        </div>
      </Container>
    </Layout>
  )
}

export async function getServerSideProps() {
  const { data, error } = await nhostClient.graphql.request(
    gql`
      query GetProjectOwners {
        projectOwners: analysis(distinct_on: owner) {
          id
          owner
        }
      }
    `
  )

  if (error) {
    return { props: { error } }
  }

  if (data) {
    return { props: { projectOwners: data.projectOwners } }
  }

  return { props: {} }
}

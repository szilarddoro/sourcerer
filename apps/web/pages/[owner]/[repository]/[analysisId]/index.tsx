import gql from 'graphql-tag'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import Card from '../../../../components/ui/Card'
import Chip from '../../../../components/ui/Chip'
import Container from '../../../../components/ui/Container'
import Heading from '../../../../components/ui/Heading'
import Layout from '../../../../components/ui/Layout'
import Link from '../../../../components/ui/Link'
import { nhostClient } from '../../../../lib/nhostClient'
import { AnalysisData } from '../../../../types/analyses'
import { RepositoryData } from '../../../../types/repositories'

export interface AnalysisDetailsPageProps {
  data?: AnalysisData
  repositoryData?: RepositoryData
  notFound?: boolean
}

export default function AnalysisDetailsPage({
  data,
  repositoryData,
  notFound
}: AnalysisDetailsPageProps) {
  const { t } = useTranslation('common')
  const {
    query: { owner, repository }
  } = useRouter()

  if (!repositoryData || !data || notFound) {
    return (
      <Layout title={`${owner}/${repository}`}>
        <Container className="justify-items-start">
          <Heading>Not Found</Heading>

          <p>This analysis does not exist.</p>

          <Link href="/" className="text-sm text-blue-500 dark:text-blue-300">
            Go back to home page
          </Link>
        </Container>
      </Layout>
    )
  }

  return (
    <Layout title={`${owner}/${repository}`}>
      <Container>
        <Heading
          component="h1"
          variant="h2"
          className="grid items-center justify-start grid-flow-col gap-3"
        >
          {repositoryData?.avatar ? (
            <img
              src={repositoryData?.avatar}
              alt={`Avatar of ${owner}`}
              className="overflow-hidden rounded-lg w-11 h-11"
            />
          ) : (
            <div className="overflow-hidden rounded-lg w-11 h-11 bg-slate-300" />
          )}

          <span className="inline-grid items-center grid-flow-col gap-2">
            <Link href={`/${owner}`} className="text-inherit">
              {owner}
            </Link>

            <span className="font-normal opacity-30">/</span>

            <Link href={`/${owner}/${repository}`} className="text-inherit">
              {repository}
            </Link>

            <span className="font-normal opacity-30">/</span>

            <Link
              href={`/${owner}/${repository}/${data.id}`}
              className="text-inherit"
            >
              {data.id.split(`-`)[0]}
            </Link>
          </span>
        </Heading>

        <section className="grid gap-2">
          <Heading variant="h2">Analysis details</Heading>

          <Card>
            <ul>
              <li>Commit hash</li>
              <li>Git branch</li>
              <li>Base path</li>
              <li>Total number of errors</li>
              <li>Total number of warnings</li>
              <li>Total number of fixable problems</li>
              <li>Trend compared to previous analysis</li>
            </ul>
          </Card>
        </section>

        <section className="grid gap-2">
          <Heading variant="h2">Problems</Heading>

          <Card className="grid grid-flow-row gap-4">
            {data.lintingResults.map(
              ({ id, filePath, errorCount, warningCount }) => {
                return (
                  <div
                    className="grid gap-2 pb-4 border-b border-slate-200 dark:border-white dark:border-opacity-5 last:border-none"
                    key={id}
                  >
                    <strong>{filePath}</strong>

                    {(errorCount > 0 || warningCount > 0) && (
                      <div className="grid items-center justify-start grid-flow-col gap-2">
                        {errorCount > 0 && (
                          <Chip level="error">
                            {t('errors', { count: errorCount })}
                          </Chip>
                        )}

                        {warningCount > 0 && (
                          <Chip level="warning">
                            {t('warnings', { count: warningCount })}
                          </Chip>
                        )}
                      </div>
                    )}
                  </div>
                )
              }
            )}
          </Card>
        </section>
      </Container>
    </Layout>
  )
}

export async function getServerSideProps(context: NextPageContext) {
  const {
    query: { owner, repository, analysisId }
  } = context

  const { data, error } = await nhostClient.graphql.request(
    gql`
      query GetAnalysisDetails(
        $id: uuid!
        $owner: String!
        $repository: String!
      ) {
        repository: repositories_by_pk(owner: $owner, name: $repository) {
          id
          owner
          name
          avatar
        }
        analysis: analyses_by_pk(id: $id) {
          id
          gitBranch
          gitCommitHash
          basePath
          lintingResults: linting_results(
            order_by: { errorCount: desc, warningCount: desc }
          ) {
            id
            filePath
            errorCount
            warningCount
          }
        }
      }
    `,
    { owner, repository, id: analysisId }
  )

  if (error) {
    return { props: { error, data: null } }
  }

  if (data && (!data.analysis || !data.repository)) {
    return { props: { data: null, notFound: true } }
  }

  return { props: { data: data.analysis, repositoryData: data.repository } }
}

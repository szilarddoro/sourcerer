import gql from 'graphql-tag'
import { NextPageContext } from 'next'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import LabelledIcon from '../../../../components/display/LabelledIcon'
import Card from '../../../../components/ui/Card'
import Chip from '../../../../components/ui/Chip'
import Container from '../../../../components/ui/Container'
import Heading from '../../../../components/ui/Heading'
import FolderIcon from '../../../../components/ui/icons/FolderIcon'
import GitBranchIcon from '../../../../components/ui/icons/GitBranchIcon'
import Layout from '../../../../components/ui/Layout'
import Link, { LinkProps } from '../../../../components/ui/Link'
import { nhostClient } from '../../../../lib/nhostClient'
import { AnalysisData } from '../../../../types/analyses'
import { RepositoryData } from '../../../../types/repositories'

export interface AnalysisDetailsPageProps {
  data?: AnalysisData
  repositoryData?: RepositoryData
  notFound?: boolean
}

function ExternalLink(props: LinkProps) {
  return (
    <Link
      className="text-sm text-blue-500 dark:text-blue-300 hover:underline"
      target="_blank"
      rel="noopener noreferrer"
      onClick={(event) => event.stopPropagation()}
      {...props}
    />
  )
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
  const githubBasePath = `https://github.com/${owner}/${repository}`

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
          className="grid items-center justify-start gap-3 sm:grid-flow-col"
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

          <span className="inline-grid items-center grid-flow-col gap-2 text-base sm:text-xl">
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
          <Heading variant="h2">Details</Heading>

          <Card className="grid gap-2">
            <div className="grid justify-start grid-flow-col gap-2">
              {data.gitBranch && (
                <LabelledIcon icon={<GitBranchIcon />}>
                  <ExternalLink
                    href={`${githubBasePath}/tree/${data.gitBranch}`}
                  >
                    {data.gitBranch}
                  </ExternalLink>{' '}
                  {data.gitCommitHash && (
                    <span className="text-sm">
                      (
                      <ExternalLink
                        href={`${githubBasePath}/tree/${data.gitCommitHash}`}
                      >
                        {data.gitCommitHash}
                      </ExternalLink>
                      )
                    </span>
                  )}
                </LabelledIcon>
              )}

              {data.basePath && (
                <LabelledIcon icon={<FolderIcon />}>
                  <ExternalLink
                    href={`${githubBasePath}/tree/${
                      data.gitCommitHash || data.gitBranch
                    }/${data.basePath}`}
                  >
                    {data.basePath}
                  </ExternalLink>
                </LabelledIcon>
              )}
            </div>

            <ul>
              <li>Total number of errors</li>
              <li>Total number of warnings</li>
              <li>Total number of fixable problems</li>
              <li>Trend compared to previous analysis</li>
              <li>Most common lint rule validation</li>
            </ul>
          </Card>
        </section>

        <section className="grid gap-2">
          <Heading variant="h2">Results</Heading>

          <Card className="grid grid-flow-row gap-4">
            {data.lintingResults.length === 0 && (
              <p>🎉 This version didn't violate any linting rules.</p>
            )}

            {data.lintingResults.map(
              ({ id, filePath, errorCount, warningCount }) => {
                return (
                  <div
                    className="grid gap-2 pb-4 border-b border-slate-200 dark:border-white dark:border-opacity-5 last:pb-0 last:border-none"
                    key={id}
                  >
                    <strong className="break-all">{filePath}</strong>

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

import gql from 'graphql-tag';
import { NextPageContext } from 'next';
import { useRouter } from 'next/router';
import { PropsWithChildren, ReactElement } from 'react';
import { twMerge } from 'tailwind-merge';
import LabelledIcon from '../../../../components/display/LabelledIcon';
import Card from '../../../../components/ui/Card';
import Chip from '../../../../components/ui/Chip';
import Container from '../../../../components/ui/Container';
import Heading from '../../../../components/ui/Heading';
import FolderIcon from '../../../../components/ui/icons/FolderIcon';
import GitBranchIcon from '../../../../components/ui/icons/GitBranchIcon';
import Layout from '../../../../components/ui/Layout';
import Link, { LinkProps } from '../../../../components/ui/Link';
import { nhostClient } from '../../../../lib/nhostClient';
import { AnalysisData } from '../../../../types/analyses';
import { RepositoryData } from '../../../../types/repositories';

export interface AnalysisDetailsPageProps {
  data?: AnalysisData;
  error?: Error;
  repositoryData?: RepositoryData;
  notFound?: boolean;
}

function ExternalLink({ className, ...props }: LinkProps) {
  return (
    <Link
      className={twMerge(
        'text-blue-500 dark:text-blue-300 hover:underline',
        className,
      )}
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  );
}

function ESLintLink({ children }: PropsWithChildren<unknown>) {
  if (typeof children !== 'string') {
    return null;
  }

  const isCustomESLintRule = new RegExp(/^.*\/.*$/).test(children);

  if (isCustomESLintRule) {
    return <span>{children}</span>;
  }

  return (
    <ExternalLink href={`https://eslint.org/docs/latest/rules/${children}`}>
      {children}
    </ExternalLink>
  );
}

function AnalysisDetailsPage({
  data,
  error,
  repositoryData,
  notFound,
}: AnalysisDetailsPageProps) {
  const {
    query: { owner, repository },
  } = useRouter();
  const githubBasePath = `https://github.com/${owner}/${repository}`;

  if (error) {
    return (
      <Container>
        <p className="text-red-500">
          <strong>Error:</strong>{' '}
          {error.message || 'Unknown error occurred. Please try again later.'}
        </p>
      </Container>
    );
  }

  if (!repositoryData || !data || notFound) {
    return (
      <Container className="justify-items-start">
        <Heading>Not Found</Heading>

        <p className="opacity-60">This analysis does not exist.</p>

        <Link href="/" className="text-sm text-blue-500 dark:text-blue-300">
          Go back to home page
        </Link>
      </Container>
    );
  }

  return (
    <Container>
      <Heading
        component="h1"
        variant="h2"
        className="grid items-center justify-start gap-3 sm:grid-flow-col"
      >
        {repositoryData?.avatar ? (
          <picture>
            <source srcSet={repositoryData.avatar} type="image/webp" />
            <img
              src={repositoryData.avatar}
              alt={`Avatar of ${owner}`}
              className="overflow-hidden rounded-lg w-11 h-11"
            />
          </picture>
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

        <Card className="grid grid-cols-2 gap-2 text-sm">
          <div className="grid justify-start grid-flow-col col-span-2 gap-2 md:col-span-1">
            {data.gitBranch && (
              <LabelledIcon className="text-sm" icon={<GitBranchIcon />}>
                <ExternalLink href={`${githubBasePath}/tree/${data.gitBranch}`}>
                  {data.gitBranch}
                </ExternalLink>{' '}
                {data.gitCommitHash && (
                  <span>
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

          <div className="grid justify-start grid-flow-col col-span-2 gap-1 md:justify-end md:col-span-1">
            <Chip level="error">Total errors: {data.errorCount}</Chip>
            <Chip level="warning">Total warnings: {data.warningCount}</Chip>
            {data.fixableErrorCount + data.fixableWarningCount > 0 && (
              <Chip level="default">
                Total fixable:{' '}
                {data.fixableErrorCount + data.fixableWarningCount}
              </Chip>
            )}
          </div>

          <div className="col-span-2">
            Most common lint rule violation:{' '}
            <ESLintLink>
              {
                [...data.lintingResults].sort((a, b) => b.count - a.count)[0]
                  .ruleId
              }
            </ESLintLink>
          </div>

          <ul>
            <li>Trend compared to previous analysis</li>
          </ul>
        </Card>
      </section>

      <section className="grid gap-2">
        <Heading variant="h2">Results</Heading>

        <Card className="grid grid-flow-row gap-4">
          {data.lintingResults.length === 0 && (
            <p>🎉 This version didn&apos;t violate any linter rules.</p>
          )}

          {data.lintingResults.map(
            ({ id, filePath, line, column, ruleId, severity, message }) => {
              return (
                <div
                  className="grid gap-2 pb-4 border-b justify-items-start border-slate-200 dark:border-white dark:border-opacity-5 last:pb-0 last:border-none"
                  key={id}
                >
                  <div className="grid items-center justify-between w-full grid-flow-col">
                    <h3 className="text-lg font-bold break-all">
                      {filePath}:{line}:{column}
                    </h3>

                    {severity === 2 && <Chip level="error">Error</Chip>}
                    {severity === 1 && <Chip level="warning">Warning</Chip>}
                  </div>

                  <p className="text-sm">
                    {message || ''} (<ESLintLink>{ruleId}</ESLintLink>)
                  </p>
                </div>
              );
            },
          )}
        </Card>
      </section>
    </Container>
  );
}

AnalysisDetailsPage.getLayout = function AnalysisDetailsPageLayout(
  page: ReactElement,
) {
  const {
    query: { owner, repository },
  } = useRouter();

  return <Layout title={`${owner}/${repository}`}>{page}</Layout>;
};

export async function getServerSideProps(context: NextPageContext) {
  const {
    query: { owner, repository, analysisId },
  } = context;

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
          errorCount
          warningCount
          fixableErrorCount
          fixableWarningCount
          lintingResults: linting_results(
            order_by: { filePath: asc, severity: asc, line: asc }
          ) {
            id
            filePath
            severity
            ruleId
            message
            line
            column
            count
          }
        }
      }
    `,
    { owner, repository, id: analysisId },
  );

  if (error) {
    if (Array.isArray(error)) {
      return { props: { error: error[0], data: null } };
    }

    if (error instanceof Error) {
      return { props: { error: error.message, data: null } };
    }

    return { props: { error: 'Unknown error occurred', data: null } };
  }

  if (data && (!data.analysis || !data.repository)) {
    return { props: { data: null, notFound: true } };
  }

  return { props: { data: data.analysis, repositoryData: data.repository } };
}

export default AnalysisDetailsPage;

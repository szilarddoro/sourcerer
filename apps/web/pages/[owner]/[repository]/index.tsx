import gql from 'graphql-tag';
import { NextPageContext } from 'next';
import { useRouter } from 'next/router';
import { ReactElement } from 'react';
import Analysis from '../../../components/display/Analysis';
import Container from '../../../components/ui/Container';
import Heading from '../../../components/ui/Heading';
import Layout from '../../../components/ui/Layout';
import Link from '../../../components/ui/Link';
import { nhostClient } from '../../../lib/nhostClient';
import type { RepositoryData } from '../../../types/repositories';

export interface RepositoryDetailsPageProps {
  data?: RepositoryData;
  error?: Error;
  notFound?: boolean;
}

function RepositoryDetailsPage({
  data,
  error,
  notFound,
}: RepositoryDetailsPageProps) {
  const {
    query: { owner, repository },
  } = useRouter();

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

  if (!data || notFound) {
    return (
      <Container className="justify-items-start">
        <Heading>Not Found</Heading>

        <p className="opacity-60">This repository does not exist.</p>

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
        {data.avatar ? (
          <picture>
            <source srcSet={data.avatar} type="image/webp" />
            <img
              src={data.avatar}
              alt={`Avatar of ${owner}`}
              className="overflow-hidden rounded-lg w-11 h-11"
            />
          </picture>
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
        </span>
      </Heading>

      <div className="grid grid-flow-row gap-5">
        {data.analyses.length === 0 ? (
          <p className="text-slate-500">No analysis results found.</p>
        ) : (
          data.analyses.map((analysis) => (
            <Analysis data={analysis} key={analysis.id} />
          ))
        )}
      </div>
    </Container>
  );
}

RepositoryDetailsPage.getLayout = function RepositoryDetailsPageLayout(
  page: ReactElement,
) {
  const {
    query: { owner, repository },
  } = useRouter();

  return <Layout title={`${owner}/${repository}`}>{page}</Layout>;
};

export async function getServerSideProps(context: NextPageContext) {
  const { owner, repository } = context.query;
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
            gitBranch
            gitCommitHash
            errorCount
            warningCount
            fixableErrorCount
            fixableWarningCount
            fatalErrorCount
          }
        }
      }
    `,
    { owner, repository },
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

  if (data && !data.repository) {
    return { props: { repository: null, notFound: true } };
  }

  return {
    props: {
      data: data.repository || null,
    },
  };
}

export default RepositoryDetailsPage;

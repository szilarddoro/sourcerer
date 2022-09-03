import gql from 'graphql-tag';
import useTranslation from 'next-translate/useTranslation';
import Card from '../components/ui/Card';
import Chip from '../components/ui/Chip';
import Container from '../components/ui/Container';
import Heading from '../components/ui/Heading';
import Layout from '../components/ui/Layout';
import Link from '../components/ui/Link';
import { nhostClient } from '../lib/nhostClient';
import type { RepositoryData } from '../types/repositories';

export interface IndexPageProps {
  data: RepositoryData[];
}

export default function IndexPage({ data }: IndexPageProps) {
  const { t } = useTranslation('common');

  const distinctReposByOwner = data.reduce(
    (reposByOwner, { owner, name, avatar }) => {
      if (reposByOwner.has(owner)) {
        return reposByOwner.set(owner, {
          avatar,
          repositories: [
            ...(reposByOwner.get(owner)?.repositories || []),
            name,
          ],
        });
      }

      return reposByOwner.set(owner, { repositories: [name], avatar });
    },
    new Map<string, { repositories: string[]; avatar: string }>(),
  );

  const distinctOwners = Array.from(distinctReposByOwner.keys()).sort();

  return (
    <Layout title="Home">
      <Container className="gap-4">
        <Heading variant="h1">Browse results</Heading>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {distinctOwners.map((owner) => {
            const data = distinctReposByOwner.get(owner);

            if (!data) {
              return null;
            }

            return (
              <Link href={`/${owner}`} key={owner}>
                <Card
                  action
                  className="grid grid-flow-row col-span-1 gap-2 justify-items-start"
                >
                  {data.avatar ? (
                    <img
                      src={data.avatar}
                      alt={`Avatar of ${owner}`}
                      className="overflow-hidden rounded-lg w-11 h-11"
                    />
                  ) : (
                    <div className="overflow-hidden rounded-lg w-11 h-11 bg-slate-300" />
                  )}

                  <strong className="text-lg">{owner}</strong>

                  <Chip>
                    {t('projects', { count: data.repositories.length })}
                  </Chip>
                </Card>
              </Link>
            );
          })}
        </div>
      </Container>
    </Layout>
  );
}

export async function getServerSideProps() {
  const { data, error } = await nhostClient.graphql.request(
    gql`
      query GetProjectOwners {
        repositories: repositories(distinct_on: name) {
          id
          owner
          name
          avatar
        }
      }
    `,
  );

  if (error) {
    return { props: { error, data: [] } };
  }

  if (data) {
    return { props: { data: data.repositories } };
  }

  return { props: {} };
}

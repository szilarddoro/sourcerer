import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import { twMerge } from 'tailwind-merge';
import type { AnalysisData } from '../../../types/analyses';
import Card, { CardProps } from '../../ui/Card';
import Chip from '../../ui/Chip';
import CalendarIcon from '../../ui/icons/CalendarIcon';
import FolderIcon from '../../ui/icons/FolderIcon';
import GitBranchIcon from '../../ui/icons/GitBranchIcon';
import Link, { LinkProps } from '../../ui/Link';
import LabelledIcon from '../LabelledIcon';

export interface AnalysisProps extends Omit<CardProps, 'data'> {
  data: AnalysisData;
}

function ExternalLink(props: LinkProps) {
  return (
    <Link
      className="text-blue-500 dark:text-blue-300 hover:underline"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  );
}

export default function Analysis({
  data: {
    id,
    updatedAt,
    basePath,
    gitBranch,
    gitCommitHash,
    errorCount,
    warningCount,
  },
  className,
  ...props
}: AnalysisProps) {
  const { t } = useTranslation('common');
  const {
    query: { owner, repository },
  } = useRouter();
  const githubBasePath = `https://github.com/${owner}/${repository}`;

  const formattedCreatedAt = Intl.DateTimeFormat('en-US', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(updatedAt));

  return (
    <Card
      className={twMerge(
        'grid grid-cols-2 gap-1 justify-items-start',
        className,
      )}
      {...props}
    >
      <Link
        className="text-blue-500 dark:text-blue-400 hover:underline"
        href={`/${owner}/${repository}/${id}`}
      >
        <strong className="col-span-1 text-lg">{id.split('-')[0]}</strong>
      </Link>

      <div className="grid items-center justify-start w-full grid-flow-col col-span-2 gap-2 md:col-span-1 md:justify-end">
        {errorCount > 0 && (
          <Chip level="error">{t('errors', { count: errorCount })}</Chip>
        )}

        {warningCount > 0 && (
          <Chip level="warning">{t('warnings', { count: warningCount })}</Chip>
        )}

        {!errorCount && !warningCount && <Chip level="success">Success</Chip>}
      </div>

      <div className="justify-start col-span-2">
        {(gitBranch || basePath) && (
          <div className="grid grid-flow-col gap-2">
            {gitBranch && (
              <LabelledIcon icon={<GitBranchIcon />}>
                <ExternalLink href={`${githubBasePath}/tree/${gitBranch}`}>
                  {gitBranch}
                </ExternalLink>{' '}
                {gitCommitHash && (
                  <span>
                    (
                    <ExternalLink
                      href={`${githubBasePath}/tree/${gitCommitHash}`}
                    >
                      {gitCommitHash}
                    </ExternalLink>
                    )
                  </span>
                )}
              </LabelledIcon>
            )}

            {basePath && (
              <LabelledIcon icon={<FolderIcon />}>
                <ExternalLink
                  href={`${githubBasePath}/tree/${
                    gitCommitHash || gitBranch
                  }/${basePath}`}
                >
                  {basePath}
                </ExternalLink>
              </LabelledIcon>
            )}
          </div>
        )}
      </div>

      <LabelledIcon className="col-span-2" icon={<CalendarIcon />}>
        {formattedCreatedAt}
      </LabelledIcon>
    </Card>
  );
}

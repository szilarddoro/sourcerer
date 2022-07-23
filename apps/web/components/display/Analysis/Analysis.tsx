import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import type { AnalysisData } from '../../../types/analyses'
import Card from '../../ui/Card'
import Chip from '../../ui/Chip'
import CalendarIcon from '../../ui/icons/CalendarIcon'
import FolderIcon from '../../ui/icons/FolderIcon'
import GitBranchIcon from '../../ui/icons/GitBranchIcon'
import Link, { LinkProps } from '../../ui/Link'
import LabelledIcon from '../LabelledIcon'

export interface AnalysisProps {
  data: AnalysisData
}

function ExternalLink(props: LinkProps) {
  return (
    <Link
      className="text-blue-500 dark:text-blue-300 hover:underline"
      target="_blank"
      rel="noopener noreferrer"
      onClick={(event) => event.stopPropagation()}
      {...props}
    />
  )
}

export default function Analysis({
  data: {
    id,
    updatedAt,
    lintingResultsAggregate,
    basePath,
    gitBranch,
    gitCommitHash
  }
}: AnalysisProps) {
  const { t } = useTranslation('common')
  const {
    query: { owner, repository }
  } = useRouter()
  const githubBasePath = `https://github.com/${owner}/${repository}`

  const formattedCreatedAt = Intl.DateTimeFormat('en-US', {
    dateStyle: 'long',
    timeStyle: 'short'
  }).format(new Date(updatedAt))

  const { errorCount, warningCount } = lintingResultsAggregate.aggregate.sum

  return (
    <Card action className="grid grid-flow-row gap-2 justify-items-start">
      <div className="grid grid-flow-row gap-1">
        <strong className="text-lg">{id.split('-')[0]}</strong>

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

      <div className="grid items-center justify-start grid-flow-col gap-2">
        {errorCount > 0 && (
          <Chip level="error">{t('errors', { count: errorCount })}</Chip>
        )}

        {warningCount > 0 && (
          <Chip level="warning">{t('warnings', { count: warningCount })}</Chip>
        )}

        {!errorCount && !warningCount && <Chip level="success">Success</Chip>}
      </div>

      <LabelledIcon icon={<CalendarIcon />}>{formattedCreatedAt}</LabelledIcon>
    </Card>
  )
}

import useTranslation from 'next-translate/useTranslation'
import type { AnalysisData } from '../../../types/analyses'
import Card from '../../ui/Card'
import Chip from '../../ui/Chip'
import CalendarIcon from '../../ui/icons/CalendarIcon'
import FolderIcon from '../../ui/icons/FolderIcon'
import GitBranchIcon from '../../ui/icons/GitBranchIcon'
import LabelledIcon from '../LabelledIcon'

export interface AnalysisProps {
  data: AnalysisData
}

export default function Analysis({
  data: { id, updatedAt, lintingResultsAggregate, basePath, gitBranch }
}: AnalysisProps) {
  const { t } = useTranslation('common')

  const formattedCreatedAt = Intl.DateTimeFormat('en-US', {
    dateStyle: 'long',
    timeStyle: 'short'
  }).format(new Date(updatedAt))

  const { errorCount, warningCount } = lintingResultsAggregate.aggregate.sum

  return (
    <Card action className="grid grid-flow-row gap-2 justify-items-start">
      <div className="grid grid-flow-row gap-1">
        <strong className="text-lg">{id.split('-')[0]}</strong>

        <div className="grid grid-flow-col gap-3">
          {gitBranch && (
            <LabelledIcon icon={<GitBranchIcon />}>{gitBranch}</LabelledIcon>
          )}

          {basePath && (
            <LabelledIcon icon={<FolderIcon />}>{basePath}</LabelledIcon>
          )}
        </div>
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

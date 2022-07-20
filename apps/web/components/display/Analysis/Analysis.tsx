import useTranslation from 'next-translate/useTranslation'
import type { AnalysisData } from '../../../types/analyses'
import Card from '../../ui/Card'
import Chip from '../../ui/Chip'
import Heading from '../../ui/Heading'
import CalendarIcon from '../../ui/icons/CalendarIcon'

export interface AnalysisProps {
  owner: string
  repository: string
  data: AnalysisData
}

export default function Analysis({
  owner,
  repository,
  data: { id, updatedAt, lintingResultsAggregate, basePath }
}: AnalysisProps) {
  const { t } = useTranslation('common')
  const formattedCreatedAt = Intl.DateTimeFormat('en', {
    dateStyle: 'long',
    timeStyle: 'short'
  }).format(new Date(updatedAt))

  const { errorCount, warningCount } = lintingResultsAggregate.aggregate.sum

  return (
    <Card
      action
      className="grid grid-flow-row gap-2 justify-items-start"
      key={id}
    >
      <div className="grid grid-flow-row gap-1">
        <Heading component="h2" variant="h3">
          {[owner, repository, basePath].filter(Boolean).join('/')}
        </Heading>

        <p className="grid items-center justify-start grid-flow-col gap-1 text-xs text-slate-500 dark:text-white dark:text-opacity-50">
          {id}
        </p>
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

      <div className="grid justify-start grid-flow-col gap-4 opacity-80">
        <p className="grid items-center justify-start grid-flow-col gap-1 text-xs text-slate-900 dark:text-white">
          <CalendarIcon aria-label="Calendar" /> {formattedCreatedAt}
        </p>
      </div>
    </Card>
  )
}

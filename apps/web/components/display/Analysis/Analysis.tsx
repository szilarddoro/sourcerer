import Card from '../../ui/Card'
import Chip from '../../ui/Chip'
import Heading from '../../ui/Heading'
import CalendarIcon from '../../ui/icons/CalendarIcon'

export interface AnalysisProps {
  data: any
}

export default function Analysis({
  data: {
    id,
    updated_at,
    linter_results,
    linter_results_aggregate,
    owner,
    repository,
    base_path
  }
}: AnalysisProps) {
  const formattedCreatedAt = Intl.DateTimeFormat('en', {
    dateStyle: 'long',
    timeStyle: 'short'
  }).format(new Date(updated_at))

  const {
    errorCount,
    warningCount,
    fatalErrorCount,
    fixableErrorCount,
    fixableWarningCount
  } = linter_results_aggregate.aggregate.sum

  return (
    <Card className="grid grid-flow-row gap-2 justify-items-start" key={id}>
      <div className="grid grid-flow-row gap-1">
        <Heading variant="h2">
          {[owner, repository, base_path].filter(Boolean).join('/')}
        </Heading>

        <p className="grid items-center justify-start grid-flow-col gap-1 text-xs text-slate-500 dark:text-white dark:text-opacity-50">
          {id}
        </p>
      </div>

      <div className="grid items-center justify-start grid-flow-col gap-2">
        {errorCount > 0 && <Chip level="error">{errorCount} errors</Chip>}

        {warningCount > 0 && (
          <Chip level="warning">{warningCount} warnings</Chip>
        )}

        {!errorCount && !warningCount && <Chip level="success">Success</Chip>}
      </div>

      <div className="grid justify-start grid-flow-col gap-4 opacity-80">
        <p className="grid items-center justify-start grid-flow-col gap-1 text-xs">
          <CalendarIcon aria-label="Calendar" /> {formattedCreatedAt}
        </p>
      </div>
    </Card>
  )
}

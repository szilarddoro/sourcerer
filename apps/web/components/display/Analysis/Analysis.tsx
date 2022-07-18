import Image from 'next/image'
import Chip from '../../ui/Chip'

export interface AnalysisProps {
  data: any
}

export default function Analysis({
  data: { id, created_at, linter_results, owner, repository, base_path }
}: AnalysisProps) {
  const formattedCreatedAt = Intl.DateTimeFormat('en', {
    dateStyle: 'long',
    timeStyle: 'short'
  }).format(new Date(created_at))

  const { errorCount, warningCount } = linter_results.reduce(
    (acc: any, curr: any) => ({
      errorCount: acc.errorCount + curr.errorCount,
      warningCount: acc.warningCount + curr.warningCount
    }),
    { errorCount: 0, warningCount: 0 }
  )

  return (
    <section
      className="grid grid-flow-row gap-2 p-4 border-2 rounded-md border-slate-200"
      key={id}
    >
      <div className="grid grid-flow-row gap-1">
        <h2 className="text-lg font-bold">
          {[owner, repository, base_path].filter(Boolean).join('/')}
        </h2>

        <p className="grid items-center justify-start grid-flow-col gap-1 text-xs text-slate-500">
          {id}
        </p>
      </div>

      <div className="grid items-center justify-start grid-flow-col gap-2">
        {errorCount > 0 && <Chip level="error">{errorCount} errors</Chip>}

        {warningCount > 0 && (
          <Chip level="warning">{warningCount} warnings</Chip>
        )}

        {errorCount === 0 && warningCount === 0 && (
          <Chip level="success">Success</Chip>
        )}
      </div>

      <div className="grid justify-start grid-flow-col gap-4 opacity-80">
        <p className="grid items-center justify-start grid-flow-col gap-1 text-xs">
          <Image src="/icons/date.svg" alt="Calendar" width={16} height={16} />{' '}
          {formattedCreatedAt}
        </p>
      </div>
    </section>
  )
}

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
      <div>
        <h2 className="text-lg font-bold">
          {[owner, repository, base_path].filter(Boolean).join('/')}
        </h2>
        <p className="text-xs text-slate-500">{id}</p>
      </div>

      <div className="grid items-center justify-start grid-flow-col gap-2">
        {errorCount > 0 && <Chip level="error">{errorCount} errors</Chip>}

        {warningCount > 0 && (
          <Chip level="warning">{warningCount} warnings</Chip>
        )}

        {errorCount === 0 && warningCount === 0 && (
          <Chip level="success">🎉 All good</Chip>
        )}
      </div>

      <p className="text-sm font-medium">{formattedCreatedAt}</p>
    </section>
  )
}

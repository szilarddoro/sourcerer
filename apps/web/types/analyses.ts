import type { LintingResultData } from './lintingResults'

export interface AnalysisData {
  id: string
  createdAt: string
  updatedAt: string
  basePath?: string
  gitBranch?: string
  gitCommitHash?: string
  lintingResults: LintingResultData[]
  lintingResultsAggregate: {
    aggregate: {
      sum: {
        errorCount: number
        warningCount: number
      }
    }
  }
}

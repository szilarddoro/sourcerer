import type { AnalysisData } from './analyses'

export interface RepositoryData {
  id: string
  owner: string
  name: string
  avatar: string
  analyses: AnalysisData[]
  analysesAggregate: {
    aggregate: {
      count: number
    }
  }
}

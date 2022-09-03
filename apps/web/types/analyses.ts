import type { LintingResultData } from './lintingResults';

export interface AnalysisData {
  id: string;
  createdAt: string;
  updatedAt: string;
  basePath?: string;
  gitBranch?: string;
  gitCommitHash?: string;
  errorCount: number;
  warningCount: number;
  fixableErrorCount: number;
  fixableWarningCount: number;
  fatalErrorCount: number;
  lintingResults: LintingResultData[];
}

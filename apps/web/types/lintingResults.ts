export interface LintingResultData {
  id: string;
  filePath: string;
  ruleId: string;
  severity: number;
  line: number;
  endLine: number;
  column: number;
  endColumn: number;
  message: string;
}

export interface LintingResultData {
  id: string
  filePath: string
  messages: object
  suppressedMessages: object
  errorCount: number
  warningCount: number
  fixableErrorCount: number
  fixableWarningCount: number
  fatalErrorCount: number
  usedDeprecatedRules: string[]
}

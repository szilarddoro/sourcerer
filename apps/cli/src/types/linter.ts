export interface ResultLocation {
  line: number;
  column: number;
}

export interface LinterSuggestion {
  messageId: string;
  fix: {
    range: [number, number];
    text: string;
  };
  desc: string;
}

export interface LinterMessage {
  ruleId: string;
  severity: number;
  message: string;
  line: number;
  column: number;
  nodeType: string;
  messageId: string;
  endLine: number;
  endColumn: number;
  suggestions: LinterSuggestion[];
}

export interface LinterResult {
  filePath: string;
  messages: LinterMessage[];
  suppressedMessages: LinterMessage[];
  errorCount: number;
  warningCount: number;
  fatalErrorCount: number;
  fixableErrorCount: number;
  fixableWarningCount: number;
  source?: string;
  usedDeprecatedRules: string[];
}

export type SimpleLinterResult = Omit<LinterResult, 'source'>;

export interface StoredLinterResult {
  filePath: string;
  ruleId: string;
  severity: number;
  line: number;
  endLine: number;
  column: number;
  endColumn: number;
  message: string;
}

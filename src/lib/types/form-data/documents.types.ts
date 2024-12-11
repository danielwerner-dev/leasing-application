export interface Documents {
  noIncome: boolean;
  audit: {
    updatedAt: string;
    updatedByIp: string;
  };
}

export enum DocumentType {
  'government-issued-id' = 'government-issued-id',
  'income-proof' = 'income-proof',
  'receipt' = 'receipt',
  'supplementary' = 'supplementary',
  'application-summary' = 'application-summary'
}

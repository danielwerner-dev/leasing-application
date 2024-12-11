import { Property, YardiIntegrationData } from '$lib/types/Application.types';

export interface CreateCoapplicantApplicationOptions {
  customerId?: string;
  paidById?: string;
}

export enum TransactionType {
  FAIL_WHEN_EXISTS = 'fail-when-exists',
  OVERWRITE = 'overwrite'
}

export interface UpdateOptions {
  returnValues?: string;
  attributeNames?: Record<string, string>;
  conditionExpression?: string;
  expressionAttributesValues?: Record<string, unknown>;
}

export interface ExternalFields {
  yardi?: YardiIntegrationData;
  property: Property;
}

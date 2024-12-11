import type { Tag } from '@aws-sdk/client-s3';
import { number, object, string } from 'yup';
import type { FormData } from './form-data/types';

export enum SubmissionStatus {
  IN_PROGRESS = 'in-progress',
  SUCCESS = 'success',
  FAIL = 'fail'
}

export enum PaymentType {
  ACH = 'ACH',
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT'
}

export enum ApplicationType {
  primary = 'primary',
  coapplicant = 'coapplicant'
}

export enum ApplicationStatus {
  created = 'created',
  draft = 'draft',
  pending = 'pending',
  deleted = 'deleted',
  completed = 'completed',
  denied = 'denied',
  approved = 'approved',
  canceled = 'canceled'
}

export enum ApplicationPermission {
  EDIT = 'canEditApplication',
  MANAGE = 'canManageApplicants',
  PAYMENTS = 'canMakePayments',
  DOCUMENTS = 'canAddDocuments',
  DOWNLOAD = 'canDownloadPDF',
  DELETE = 'canDeleteApplication'
}

export const EDITABLE_STATUS = [
  ApplicationStatus.created,
  ApplicationStatus.draft
];

export interface Customer {
  customerId: string;
  email: string;
}

export interface Property {
  puCode: string;
  propertyCode: string;
  unitCode: string;
  isSyndicated: boolean;
  slug: string;
  propertyUrl: string;
  city: string;
  state: string;
  zipcode: string;
  address1: string;
  beds: number;
  baths: string;
  sqft: number;
  marketRent: string;
  availableAt: string;
  unitStatus: string;
  market: {
    slug: string;
  };
}

export interface Submission {
  amountPaid: number;
  paymentMethod: string;
}

export const propertySchema = object({
  puCode: string().required(),
  propertyCode: string().required(),
  unitCode: string().required(),
  slug: string().required(),
  propertyUrl: string().required(),
  city: string().required(),
  state: string().required(),
  zipcode: string().required(),
  address1: string().required(),
  beds: number().required(),
  baths: string().required(),
  sqft: number().required(),
  marketRent: string().required(),
  availableAt: string().required(),
  unitStatus: string().required(),
  market: object({
    slug: string().required()
  }).required()
});

export interface YardiPaymentInfo {
  paymentType: PaymentType;
  description: string;
  payerId: string;
}

export interface YardiIntegrationData {
  guestcardId: string;
  applicantId: string;
  awaitingPaymentInfo?: boolean;
  paymentInfo?: YardiPaymentInfo;
}

export interface File {
  documentId: string;
  type: string;
  tags: Tag[];
}

export interface IntegrationData {
  yardi?: YardiIntegrationData;
  files?: File[];
}

export interface Audit {
  createdAt: string;
  createdByIp?: string;
  updatedAt?: string;
  updatedByIp?: string;
  submittedAt?: string;
  submittedByIp?: string;
  submittedStatus?: SubmissionStatus;
}

export interface PrimaryApplicationData {
  leaseTerm: string;
  leaseStartDate: string;
  applicationType: string;
  firstName: string;
  lastName: string;
}

export type Permissions = {
  [key in ApplicationPermission]?: boolean;
};

export interface Application {
  applicationId: string;
  applicationType: ApplicationType;
  applicationStatus: ApplicationStatus;
  primaryApplicationId: string;
  applicationVersion: string;
  customer: Customer;
  property: Property;
  submission: Submission;
  formData: FormData;
  integrationData: IntegrationData;
  audit: Audit;
  primaryApplicationData?: PrimaryApplicationData;
  paidById?: string;
  promoted: boolean;
  yardiOwned?: boolean;
  permissions?: Permissions;
}

export interface DynamoDBApplication extends Record<string, unknown> {
  PK: string;
  customerId: string;
  email: string;
  applicationType: ApplicationType;
  applicationStatus: ApplicationStatus;
  primaryApplicationId: string;
  applicationVersion: string;
  guestcardId?: string;
  applicantId?: string;
  property: Property;
  submission: Submission;
  formData: FormData;
  integrationData: DynamoDBIntegrationData;
  audit: Audit;
  primaryApplicationData?: PrimaryApplicationData;
  paidById?: string;
  promoted?: boolean;
  yardiOwned?: boolean;
}

export interface DynamoDBIntegrationData {
  yardi?: DynamoDBYardiData;
  files?: File[];
}

export interface DynamoDBYardiData {
  awaitingPaymentInfo?: boolean;
  paymentInfo?: YardiPaymentInfo;
}

export interface Headers {
  ipAddress: string;
}

export interface PromotedApplicationFields {
  yardi: YardiIntegrationData;
  promotedApplicationId: string;
}

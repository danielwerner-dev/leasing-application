import { v4 as uuid } from 'uuid';
import {
  Application,
  ApplicationStatus,
  ApplicationType,
  Customer,
  DynamoDBApplication,
  Property
} from '$lib/types/Application.types';
import { DBClient } from '$lib/repositories/leasing-application/dynamo-client';
import { Coapplicant } from '$lib/types/form-data/coapplicants.types';
import { InternalServerError } from '$lib/types/errors';
import GeneralSchema from '$lib/form-validation/schemas/form-data/general.schema';
import { getValidationContext } from '$lib/utils/form-validation';
import { getApplication } from './read-application';
import { YardiBasicInfo } from '$lib/form-validation/schemas/integration-data/yardi-integration-data.schema';
import { CreateCoapplicantApplicationOptions } from '$lib/types/repository.types';

export const createPrimaryApplication = async (
  customer: Customer,
  property: Property,
  ipAddress: string
): Promise<Application> => {
  const now = new Date().toISOString();
  const applicationId = await uuid();

  const application: DynamoDBApplication = {
    PK: `${applicationId}`,
    customerId: customer.customerId,
    email: customer.email,
    primaryApplicationId: `${applicationId}`,
    paidById: '',
    applicationType: ApplicationType.primary,
    property,
    submission: {
      amountPaid: 0,
      paymentMethod: ''
    },
    applicationStatus: ApplicationStatus.draft,
    applicationVersion: 'v1',
    formData: {},
    integrationData: {},
    audit: {
      createdAt: now,
      createdByIp: ipAddress,
      updatedAt: '',
      updatedByIp: '',
      submittedAt: '',
      submittedByIp: ''
    }
  };

  await DBClient.set(application);

  const createdApplication = await getApplication(applicationId);
  if (!createdApplication) {
    throw new InternalServerError('Error creating application');
  }

  return createdApplication;
};

export const createCoapplicantApplication = async (
  primaryApplication: Application,
  coapplicant: Coapplicant,
  ipAddress: string,
  options: CreateCoapplicantApplicationOptions,
  yardiBasicInfo: YardiBasicInfo
): Promise<Application> => {
  const { formData } = primaryApplication;
  const validationContext = getValidationContext(primaryApplication);
  const generalData = GeneralSchema.validateSync(formData.general, {
    context: validationContext
  });

  const now = new Date().toISOString();
  const coapplicantApplicationId = await uuid();
  const applicationStatus = options?.customerId
    ? ApplicationStatus.draft
    : ApplicationStatus.created;

  const application: DynamoDBApplication = {
    PK: `${coapplicantApplicationId}`,
    customerId: options?.customerId || 'coapplicant',
    primaryApplicationId: `${primaryApplication.applicationId}`,
    email: coapplicant.email,
    primaryApplicationData: {
      firstName: coapplicant.firstName,
      lastName: coapplicant.lastName,
      applicationType: coapplicant.type,
      leaseStartDate: generalData.leaseStartDate,
      leaseTerm: generalData.leaseTerm
    },
    paidById: options?.paidById || '',
    applicationType: ApplicationType.coapplicant,
    property: primaryApplication.property,
    submission: {
      amountPaid: 0,
      paymentMethod: ''
    },
    formData: {},
    integrationData: {},
    guestcardId: yardiBasicInfo.guestcardId,
    applicantId: yardiBasicInfo.applicantId,
    applicationStatus,
    applicationVersion: 'v1',
    audit: {
      createdAt: now,
      createdByIp: ipAddress,
      updatedAt: '',
      updatedByIp: '',
      submittedAt: '',
      submittedByIp: ''
    }
  };

  await DBClient.set(application);

  const createdApplication = await getApplication(coapplicantApplicationId);
  if (!createdApplication) {
    throw new InternalServerError('Error creating coapplicant application');
  }

  return createdApplication;
};

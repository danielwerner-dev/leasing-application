import logger from '$lib/utils/logger';
import { string } from 'yup';

import { createCoapplicantApplication } from '$lib/repositories/leasing-application/create-application';

import { getCustomerByEmail } from '$lib/connectors/customer-service';

import { coapplicantSchema } from '$lib/form-validation/schemas/form-data/coapplicants.schema';
import { ConflictError } from '$lib/types/errors';
import { Application, ApplicationStatus } from '$lib/types/Application.types';
import { Coapplicant } from '$lib/types/form-data/coapplicants.types';

import {
  YardiBasicInfo,
  yardiBasicInfoSchema
} from '$lib/form-validation/schemas/integration-data/yardi-integration-data.schema';
import { emailCoapplicantInvite } from './EmailCoapplicantInvite';
import { YardiCoapplicant } from '$lib/types/yardi.types';

export const createCoapplicantService = async (
  primaryApplication: Application,
  coapplicant: Coapplicant,
  ipAddress: string,
  yardiInfo: YardiBasicInfo,
  paidById = ''
): Promise<Application> => {
  logger.info(
    `[CreateCoapplicantService] primaryApplication: ${primaryApplication.applicationId}`
  );
  const { applicationId, applicationStatus } = primaryApplication;
  if (primaryApplication.applicationStatus !== ApplicationStatus.pending) {
    throw new ConflictError(
      `Cannot create co-applicant for application ${applicationId} in current status: ${applicationStatus}`
    );
  }

  const existingCustomer = await getCustomerByEmail(coapplicant.email);
  const coapplicantData = coapplicantSchema.validateSync(coapplicant);
  const validatedYardiInfo = yardiBasicInfoSchema.validateSync(yardiInfo);

  const coapplicantApplication = await createCoapplicantApplication(
    primaryApplication,
    coapplicantData,
    ipAddress,
    {
      paidById,
      customerId: existingCustomer?.customerId || ''
    },
    validatedYardiInfo
  );

  await emailCoapplicantInvite(primaryApplication, coapplicantApplication);

  return coapplicantApplication;
};

export const createCoapplicantApplications = async (
  primaryApplication: Application,
  paidApplicants: string[],
  ipAddress: string,
  coapplicants: YardiCoapplicant[]
): Promise<Application[]> => {
  logger.info(
    `[CreateCoapplicantApplications] primaryApplication: ${primaryApplication.applicationId}]`
  );
  const guestcardId = string()
    .required('guestcardId is required')
    .validateSync(primaryApplication.integrationData?.yardi?.guestcardId);

  const promises = coapplicants.map((coapplicant) => {
    const paidById = paidApplicants.includes(coapplicant.email)
      ? primaryApplication.customer.customerId
      : '';

    const yardiInfo = {
      applicantId: coapplicant.applicantId,
      guestcardId: guestcardId
    };

    const validatedYardiInfo = yardiBasicInfoSchema.validateSync(yardiInfo);

    return createCoapplicantService(
      primaryApplication,
      coapplicant,
      ipAddress,
      validatedYardiInfo,
      paidById
    );
  });

  return await Promise.all(promises);
};

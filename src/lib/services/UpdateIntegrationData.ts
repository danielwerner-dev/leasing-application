import logger from '$lib/utils/logger';
import { string, object } from 'yup';

import { updateIntegrationData } from '$lib/repositories/leasing-application/update-application';

import {
  Application,
  ApplicationStatus,
  IntegrationData,
  YardiPaymentInfo
} from '$lib/types/Application.types';
import { ConflictError } from '$lib/types/errors';

export const updateIntegrationDataService = async (
  application: Application,
  integrationData: IntegrationData
) => {
  if (application.applicationStatus === ApplicationStatus.deleted) {
    throw new ConflictError(
      `Cannot update application with status ${application.applicationStatus}`
    );
  }

  await updateIntegrationData(application.applicationId, integrationData);
};

export const createYardiPaymentInfo = async (
  application: Application,
  paymentInfo: YardiPaymentInfo
) => {
  const { applicationId } = application;

  const preconditions = object({
    yardi: object({
      applicantId: string().required(
        `Application ${applicationId} is missing applicantId`
      ),
      guestcardId: string().required(
        `Application ${applicationId} is missing guestcardId`
      )
    }).required(`Application ${applicationId} is missing Yardi data`)
  }).required(`Application ${applicationId} is missing integration data`);

  const validatedData = preconditions.validateSync(application.integrationData);

  const { integrationData } = application;

  integrationData.yardi = {
    ...validatedData.yardi,
    awaitingPaymentInfo: false,
    paymentInfo: paymentInfo
  };

  logger.info(
    `Saving integration data for application ${application.applicationId}`
  );

  await updateIntegrationDataService(application, integrationData);
};

export const updateAwaitingPaymentInfo = async (
  application: Application,
  awaitingPaymentInfo: boolean
) => {
  const {
    integrationData: { yardi },
    applicationId
  } = application;

  if (!yardi) {
    throw new ConflictError(
      `Impossible to set "awaitingPaymentInfo" for application ${applicationId}. Missing Yardi info.`
    );
  }

  const integrationData: IntegrationData = {
    yardi: {
      ...yardi,
      awaitingPaymentInfo: awaitingPaymentInfo
    }
  };

  await updateIntegrationDataService(application, integrationData);
};

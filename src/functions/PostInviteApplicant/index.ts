import { Handler } from 'aws-lambda';
import { applicationHandlerFactory } from '$lib/middleware/api-gateway';
import { LeasingApplicationAccessCallback } from '$lib/types/authorizer.types';
import { object, string } from 'yup';
import { emailCoapplicantInvite } from '$lib/services/EmailCoapplicantInvite';
import { getApplication } from '$lib/repositories/leasing-application/read-application';
import { BadRequestError } from '$lib/types/errors';

export const requestHandler: LeasingApplicationAccessCallback = async (
  event,
  primaryApplication
) => {
  const preconditions = object({
    coapplicantApplicationId: string().required(
      'Co-applicant application id is missing'
    )
  }).required('Empty payload');

  const { coapplicantApplicationId } = preconditions.validateSync(
    JSON.parse(event.body || '')
  );

  const coapplicantApplication = await getApplication(coapplicantApplicationId);

  if (
    coapplicantApplication?.primaryApplicationId !==
    primaryApplication.applicationId
  ) {
    throw new BadRequestError(
      "Cannot Invite. Coapplicant application isn't associated with primary application"
    );
  }

  await emailCoapplicantInvite(primaryApplication, coapplicantApplication);

  return {
    statusCode: 200,
    body: '',
    headers: { 'content-type': 'application/json' }
  };
};

export const handler: Handler = applicationHandlerFactory(requestHandler);

import { Handler } from 'aws-lambda';
import { validate as validateUUID } from 'uuid';
import { applicationHandlerFactory } from '$lib/middleware/api-gateway';
import { updateApplicationCustomerService } from '$lib/services/UpdateApplicationCustomer';
import { LeasingApplicationAccessCallback } from '$lib/types/authorizer.types';
import { object, string } from 'yup';

export const requestHandler: LeasingApplicationAccessCallback = async (
  event,
  application
) => {
  const preconditions = object({
    coapplicantApplicationId: string()
      .required('Missong co-applicant application id')
      .test('Valid UUID', 'Invalid UUID', validateUUID),
    email: string().required('Missing e-mail address')
  }).required('Empty payload');

  const { coapplicantApplicationId, email } = preconditions.validateSync(
    event.body
  );

  await updateApplicationCustomerService(
    application,
    coapplicantApplicationId,
    email
  );

  return {
    statusCode: 200,
    body: '',
    headers: { 'content-type': 'application/json' }
  };
};

export const handler: Handler = applicationHandlerFactory(requestHandler);

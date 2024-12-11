import { Handler } from 'aws-lambda';
import { identityHandlerFactory } from '$lib/middleware/api-gateway';
import { IdentityVerificationCallback } from '$lib/types/authorizer.types';
import { object, string } from 'yup';
import { getApplicationsByCustomerId } from '$lib/services/GetApplication';

export const requestHandler: IdentityVerificationCallback = async (event) => {
  const preconditions = object({
    customerId: string().required('Missing customerId')
  }).required();

  const { customerId } = preconditions.validateSync(event.pathParameters);

  const applications = await getApplicationsByCustomerId(customerId);

  return {
    statusCode: 200,
    body: JSON.stringify({
      customerId,
      applications
    }),
    headers: { 'content-type': 'application/json' }
  };
};

export const handler: Handler = identityHandlerFactory(requestHandler);

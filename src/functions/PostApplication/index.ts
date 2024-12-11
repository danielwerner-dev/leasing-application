import { Handler } from 'aws-lambda';
import { identityHandlerFactory } from '$lib/middleware/api-gateway';
import { createApplicationService } from '$lib/services/CreateApplication';
import { IdentityVerificationCallback } from '$lib/types/authorizer.types';
import { BadRequestError } from '$lib/types/errors';
import { object, string } from 'yup';

export const requestHandler: IdentityVerificationCallback = async (event) => {
  const preconditions = object({
    customer: object({
      customerId: string().required('Customer id is missing'),
      email: string().required('E-mail is missing')
    }).required(),
    propertySlug: string().required()
  }).required('Empty request');

  const { customer, propertySlug } = preconditions.validateSync(
    JSON.parse(event.body || '')
  );
  const ipAddress = event.headers['client-ip-address'];

  if (!ipAddress) {
    throw new BadRequestError(
      'Ip Address not found or provided in request headers'
    );
  }

  const application = await createApplicationService(
    customer,
    propertySlug,
    ipAddress
  );

  return {
    statusCode: 201,
    body: JSON.stringify(application),
    headers: { 'content-type': 'application/json' }
  };
};

export const handler: Handler = identityHandlerFactory(requestHandler);

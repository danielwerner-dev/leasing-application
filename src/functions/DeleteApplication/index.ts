import { Handler } from 'aws-lambda';
import { applicationHandlerFactory } from '$lib/middleware/api-gateway';
import { deleteApplicationService } from '$lib/services/DeleteApplication';
import { BadRequestError } from '$lib/types/errors';
import { LeasingApplicationAccessCallback } from '$lib/types/authorizer.types';

export const requestHandler: LeasingApplicationAccessCallback = async (
  event,
  application
) => {
  if (!event.body) {
    throw new BadRequestError('Empty request');
  }

  const { reason } = JSON.parse(event.body);

  await deleteApplicationService(application, reason);

  return {
    statusCode: 200,
    body: '',
    headers: { 'content-type': 'application/json' }
  };
};

export const handler: Handler = applicationHandlerFactory(requestHandler);

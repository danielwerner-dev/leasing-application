import { Handler } from 'aws-lambda';
import { applicationHandlerFactory } from '$lib/middleware/api-gateway';
import { listLinkedApplications } from '$lib/services/ListLinkedApplications';
import { LeasingApplicationAccessCallback } from '$lib/types/authorizer.types';

export const requestHandler: LeasingApplicationAccessCallback = async (
  _event,
  application
) => {
  const applications = await listLinkedApplications(application);

  return {
    statusCode: 200,
    body: JSON.stringify({
      applications
    }),
    headers: { 'content-type': 'application/json' }
  };
};

export const handler: Handler = applicationHandlerFactory(requestHandler);

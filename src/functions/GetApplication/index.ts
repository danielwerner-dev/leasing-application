import { Handler } from 'aws-lambda';
import { applicationHandlerFactory } from '$lib/middleware/api-gateway';
import { Application } from '$lib/types/Application.types';
import { LeasingApplicationAccessCallback } from '$lib/types/authorizer.types';
import { getUpdatedApplication } from '$lib/services/GetApplication';

export const requestHandler: LeasingApplicationAccessCallback = async (
  _event,
  application: Application
) => {
  const updatedApplication = await getUpdatedApplication(application);

  return {
    statusCode: 200,
    body: JSON.stringify(updatedApplication),
    headers: { 'content-type': 'application/json' }
  };
};

export const handler: Handler = applicationHandlerFactory(requestHandler);

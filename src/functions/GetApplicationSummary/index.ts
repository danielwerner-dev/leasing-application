import { Handler } from 'aws-lambda';

import { getApplicationPDFService } from '$lib/services/GetApplicationSummary';

import { applicationHandlerFactory } from '$lib/middleware/api-gateway';
import { LeasingApplicationAccessCallback } from '$lib/types/authorizer.types';

export const requestHandler: LeasingApplicationAccessCallback = async (
  _event,
  application
) => {
  const pdf = await getApplicationPDFService(application);

  return {
    statusCode: 200,
    body: pdf,
    headers: { 'content-type': 'application/pdf' },
    isBase64Encoded: true
  };
};

export const handler: Handler = applicationHandlerFactory(requestHandler);

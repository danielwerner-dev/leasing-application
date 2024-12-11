import { Handler } from 'aws-lambda';
import { applicationHandlerFactory } from '$lib/middleware/api-gateway';
import { listDocumentsService } from '$lib/services/GetDocumentsList';
import { LeasingApplicationAccessCallback } from '$lib/types/authorizer.types';

export const requestHandler: LeasingApplicationAccessCallback = async (
  _event,
  application
) => {
  const documents = await listDocumentsService(application);

  return {
    statusCode: 200,
    body: JSON.stringify(documents),
    headers: { 'content-type': 'application/json' }
  };
};

export const handler: Handler = applicationHandlerFactory(requestHandler);

import { Handler } from 'aws-lambda';
import { applicationHandlerFactory } from '$lib/middleware/api-gateway';
import { getDocumentService } from '$lib/services/GetDocument';
import { LeasingApplicationAccessCallback } from '$lib/types/authorizer.types';
import { object, string } from 'yup';

export const requestHandler: LeasingApplicationAccessCallback = async (
  event,
  application
) => {
  const preconditions = object({
    documentId: string().required('Could not find document id in path')
  }).required('Could not find document id in path');

  const { documentId } = preconditions.validateSync(event.pathParameters);

  const downloadInfo = await getDocumentService(application, documentId);

  return {
    statusCode: 200,
    body: JSON.stringify(downloadInfo),
    headers: { 'content-type': 'application/json' }
  };
};

export const handler: Handler = applicationHandlerFactory(requestHandler);

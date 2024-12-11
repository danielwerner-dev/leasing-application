import { Handler } from 'aws-lambda';
import { applicationHandlerFactory } from '$lib/middleware/api-gateway';
import { object, string } from 'yup';
import { deleteDocumentService } from '$lib/services/DeleteDocument';
import { LeasingApplicationAccessCallback } from '$lib/types/authorizer.types';

export const requestHandler: LeasingApplicationAccessCallback = async (
  event,
  application
) => {
  const preconditions = object({
    documentId: string()
      .required('Document id is missing')
      .typeError('Document id is invalid')
  }).required();

  const { documentId } = preconditions.validateSync(event.pathParameters);

  await deleteDocumentService(application, documentId);

  return {
    statusCode: 204,
    body: '',
    headers: { 'content-type': 'application/json' }
  };
};

export const handler: Handler = applicationHandlerFactory(requestHandler);

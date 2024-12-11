import { Handler } from 'aws-lambda';
import { applicationHandlerFactory } from '$lib/middleware/api-gateway';
import { createDocumentService } from '$lib/services/CreateDocument';
import { LeasingApplicationAccessCallback } from '$lib/types/authorizer.types';
import { object, string } from 'yup';
import { DocumentType } from '$lib/types/form-data/documents.types';

export const requestHandler: LeasingApplicationAccessCallback = async (
  event,
  application
) => {
  const preconditions = object({
    documentType: string()
      .oneOf(Object.values(DocumentType))
      .required('Document type is missing'),
    documentDisplayName: string()
      .required('Document display name is missing')
      .matches(/^[a-zA-Z0-9.\-_+\s]+$/, 'Invalid characters')
  }).required('Empty request');

  const { documentDisplayName, documentType } = preconditions.validateSync(
    JSON.parse(event.body || '')
  );

  const resultRequest = await createDocumentService(
    application,
    DocumentType[documentType],
    documentDisplayName
  );

  return {
    statusCode: 200,
    body: JSON.stringify(resultRequest),
    headers: { 'content-type': 'application/json' }
  };
};

export const handler: Handler = applicationHandlerFactory(requestHandler);

import { getDocumentUploadUrl } from '$lib/connectors/s3';

import { BadRequestError } from '$lib/types/errors';
import { Application } from '$lib/types/Application.types';
import { DocumentType } from '$lib/types/form-data/documents.types';

export const createDocumentService = async (
  application: Application,
  documentType: DocumentType,
  documentDisplayName: string
) => {
  if (!Object.values(DocumentType).includes(documentType)) {
    throw new BadRequestError(`Invalid document type: ${documentType}`);
  }

  return await getDocumentUploadUrl(
    application.applicationId,
    documentType,
    documentDisplayName
  );
};

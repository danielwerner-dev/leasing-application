import { deleteDocument } from '$lib/connectors/s3';

import { Application } from '$lib/types/Application.types';

export const deleteDocumentService = async (
  application: Application,
  documentId: string
) => {
  await deleteDocument(application.applicationId, documentId);
};

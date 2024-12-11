import { getDocumentDownloadUrl } from '$lib/connectors/s3';

import { Application } from '$lib/types/Application.types';

export const getDocumentService = async (
  application: Application,
  documentId: string
) => {
  return await getDocumentDownloadUrl(application.applicationId, documentId);
};

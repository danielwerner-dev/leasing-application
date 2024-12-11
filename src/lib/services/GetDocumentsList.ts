import {
  DocumentUrlParams,
  getDocumentDownloadUrl,
  listApplicationDocuments
} from '$lib/connectors/s3';

import { Application } from '$lib/types/Application.types';
import { SignedDocument } from '$lib/types/Documents.types';
import { getTag } from '$lib/utils/documents';

const SIGNED_EXPIRES_IN_SECONDS = 1800;

export const listDocumentsService = async (application: Application) => {
  return await listApplicationDocuments(application.applicationId);
};

export const listAndSignDocumentsService = async (
  application: Application
): Promise<SignedDocument[]> => {
  const requests: Promise<DocumentUrlParams>[] = [];
  const fileLookup = {};

  const documentList = await listApplicationDocuments(
    application.applicationId
  );

  documentList.forEach((document) => {
    requests.push(
      getDocumentDownloadUrl(
        application.applicationId,
        document.documentId,
        SIGNED_EXPIRES_IN_SECONDS
      )
    );
    fileLookup[document.documentId] = document;
  });

  const res = await Promise.all(requests);

  return res.map((res) => {
    return {
      documentId: res.documentId,
      documentName: getTag(fileLookup[res.documentId], 'document-display-name'),
      documentType: getTag(fileLookup[res.documentId], 'document-type'),
      signedDocumentUrl: res.documentUrl
    };
  });
};

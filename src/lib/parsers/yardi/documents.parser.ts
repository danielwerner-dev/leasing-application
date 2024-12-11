import { SignedDocument } from '$lib/types/Documents.types';
import { DocumentDataType, YardiDocument } from '$lib/types/yardi.types';

export const toYardiDocuments = (
  documents: SignedDocument[]
): YardiDocument[] => {
  return documents.map((document) => {
    return {
      documentId: document.documentId,
      documentName: document.documentName,
      documentType: document.documentType,
      dataType: DocumentDataType.URL,
      data: document.signedDocumentUrl
    };
  });
};

import * as s3 from '$lib/connectors/s3';
import * as service from '$lib/services/CreateDocument';
import { applicationFixture } from '$fixtures';
import { DocumentType } from '$lib/types/form-data/documents.types';

jest.mock('$lib/connectors/s3', () => {
  return {
    getDocumentUploadUrl: jest.fn()
  };
});

describe('Create Document Service', () => {
  let application;
  let documentType: DocumentType;
  let documentDisplayName;
  beforeEach(() => {
    jest.spyOn(s3, 'getDocumentUploadUrl');

    application = applicationFixture();
    documentType = DocumentType['income-proof'];
    documentDisplayName = 'test';
  });

  it('calls getDocumentUploadUrl on success', async () => {
    await service.createDocumentService(
      application,
      documentType,
      documentDisplayName
    );

    expect(s3.getDocumentUploadUrl).toHaveBeenCalledWith(
      application.applicationId,
      documentType,
      documentDisplayName
    );
  });

  it('throws if documentType is not valid', async () => {
    documentType = 'invalid-document-type' as unknown as DocumentType;
    await expect(
      service.createDocumentService(
        application,
        documentType,
        documentDisplayName
      )
    ).rejects.toThrowError(`Invalid document type: ${documentType}`);

    expect(s3.getDocumentUploadUrl).not.toHaveBeenCalled();
  });
});

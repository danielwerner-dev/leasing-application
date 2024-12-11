import * as s3 from '$lib/connectors/s3';
import * as service from '$lib/services/DeleteDocument';
import { applicationFixture } from '$fixtures';

jest.mock('$lib/connectors/s3', () => {
  return {
    deleteDocument: jest.fn()
  };
});

describe('Delete Document Service', () => {
  describe('deleteDocumentService', () => {
    let application;
    let documentId;
    beforeEach(() => {
      jest.spyOn(s3, 'deleteDocument');

      application = applicationFixture();
      documentId = 'test';
    });

    it('calls s3.deleteDocument', async () => {
      await service.deleteDocumentService(application, documentId);

      expect(s3.deleteDocument).toHaveBeenCalledWith(
        application.applicationId,
        documentId
      );
    });
  });
});

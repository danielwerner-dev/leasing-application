import * as s3 from '$lib/connectors/s3';
import * as service from '$lib/services/GetDocument';
import { applicationFixture } from '$fixtures';

jest.mock('$lib/connectors/s3', () => {
  return {
    getDocumentDownloadUrl: jest.fn()
  };
});

describe('Get Document Service', () => {
  describe('getDocumentService', () => {
    let application;
    let documentId;
    beforeEach(() => {
      application = applicationFixture();
      documentId = 'test';

      jest.spyOn(s3, 'getDocumentDownloadUrl');
    });

    it('calls s3.getDocumentDowloadUrl', async () => {
      await service.getDocumentService(application, documentId);

      expect(s3.getDocumentDownloadUrl).toHaveBeenCalledWith(
        application.applicationId,
        documentId
      );
    });
  });
});

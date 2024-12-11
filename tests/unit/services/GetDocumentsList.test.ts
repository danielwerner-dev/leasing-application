import { applicationFixture } from '$fixtures';
import { applicationDocumentsFixture } from '$fixtures/s3.fixtures';
import * as s3 from '$lib/connectors/s3';
import * as service from '$lib/services/GetDocumentsList';
import { SignedDocument } from '$lib/types/Documents.types';

jest.mock('$lib/connectors/s3', () => {
  return {
    listApplicationDocuments: jest.fn(),
    getDocumentDownloadUrl: jest.fn()
  };
});

describe('Get Documents List Service', () => {
  describe('listDocumentsService', () => {
    let application;
    beforeEach(() => {
      application = applicationFixture();

      jest.spyOn(s3, 'listApplicationDocuments');
    });

    it('calls s3.listApplicationDocuments', async () => {
      await service.listDocumentsService(application);

      expect(s3.listApplicationDocuments).toHaveBeenCalledWith(
        application.applicationId
      );
    });
  });
});

describe('Get And Sign Documents List Service', () => {
  describe('listDocumentsService', () => {
    let application;
    beforeEach(() => {
      application = applicationFixture();

      jest
        .spyOn(s3, 'listApplicationDocuments')
        .mockResolvedValue(applicationDocumentsFixture());

      jest
        .spyOn(s3, 'getDocumentDownloadUrl')
        .mockResolvedValue({
          documentId: 'government-issued-id_2023-01-11T17:21:03.479Z.jpeg',
          documentUrl: 'https://a.com'
        })
        .mockResolvedValueOnce({
          documentId: 'government-issued-id_2023-01-12T10:11:03.045Z.jpeg',
          documentUrl: 'https://b.com'
        })
        .mockResolvedValueOnce({
          documentId: 'proof-of-income_2023-01-12T10:15:03.479Z.jpeg',
          documentUrl: 'https://c.com'
        })
        .mockResolvedValueOnce({
          documentId: 'vouchers_2023-01-12T10:22:03.479Z.jpeg',
          documentUrl: 'https://d.com'
        })
        .mockResolvedValueOnce({
          documentId: 'supplemental_2023-01-12T10:25:03.479Z.jpeg',
          documentUrl: 'https://e.com'
        });
    });

    it('calls s3.listApplicationDocuments', async () => {
      const res = await service.listAndSignDocumentsService(application);

      expect(s3.getDocumentDownloadUrl).toHaveBeenCalledTimes(5);
      expect(res.length).toBe(5);
      expect(
        documentWithId(
          res,
          'government-issued-id_2023-01-11T17:21:03.479Z.jpeg'
        )
      ).toHaveProperty('signedDocumentUrl', 'https://a.com');
      expect(
        documentWithId(
          res,
          'government-issued-id_2023-01-12T10:11:03.045Z.jpeg'
        )
      ).toHaveProperty('signedDocumentUrl', 'https://b.com');
      expect(
        documentWithId(res, 'proof-of-income_2023-01-12T10:15:03.479Z.jpeg')
      ).toHaveProperty('signedDocumentUrl', 'https://c.com');
      expect(
        documentWithId(res, 'vouchers_2023-01-12T10:22:03.479Z.jpeg')
      ).toHaveProperty('signedDocumentUrl', 'https://d.com');
      expect(
        documentWithId(res, 'supplemental_2023-01-12T10:25:03.479Z.jpeg')
      ).toHaveProperty('signedDocumentUrl', 'https://e.com');
    });
  });
});

const documentWithId = (results: SignedDocument[], id: string) => {
  return results.find((doc) => doc.documentId === id);
};

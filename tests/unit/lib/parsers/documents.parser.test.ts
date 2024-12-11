import { toYardiDocuments } from '$lib/parsers/yardi/documents.parser';

describe('Documents Parser', () => {
  describe('toYardiDocuments', () => {
    it('Should marshall signed documents to Yardi Documents', () => {
      const signedDocuments = [
        {
          documentId: 'signed-document-id',
          documentName: 'Signed Document Name',
          documentType: 'signed-document-type',
          signedDocumentUrl: 'https://signed-document-url.com'
        }
      ];
      const res = toYardiDocuments(signedDocuments);

      expect(res.length).toBe(1);
      expect(res[0]).toEqual(
        expect.objectContaining({
          documentId: 'signed-document-id',
          documentName: 'Signed Document Name',
          documentType: 'signed-document-type',
          dataType: 'url',
          data: 'https://signed-document-url.com'
        })
      );
    });

    it('Should succeed when no documents provided', () => {
      const signedDocuments = [];

      const res = toYardiDocuments(signedDocuments);

      expect(res).toEqual([]);
    });
  });
});

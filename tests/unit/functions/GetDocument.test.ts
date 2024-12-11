import * as lambda from '$functions/GetDocument';
import * as service from '$lib/services/GetDocument';

jest.mock('$lib/services/GetDocument', () => {
  return {
    getDocumentService: jest.fn()
  };
});

describe('GetDocument lambda tests', () => {
  describe('requestHandler', () => {
    let event: any;
    let application: any;
    beforeEach(() => {
      event = { pathParameters: { documentId: 'document-id' } };
      application = 'application';

      jest
        .spyOn(service, 'getDocumentService')
        .mockResolvedValue('document-info' as any);
    });

    it('returns 200 on success', async () => {
      const res = await lambda.requestHandler(event, application, null as any);

      const expected = {
        statusCode: 200,
        body: JSON.stringify('document-info'),
        headers: { 'content-type': 'application/json' }
      };

      expect(res).toEqual(expected);
      expect(service.getDocumentService).toHaveBeenCalledWith(
        application,
        'document-id'
      );
    });

    it('throws if documentId is missing', async () => {
      event.pathParameters = {};
      await expect(
        lambda.requestHandler(event, application, null as any)
      ).rejects.toThrow();
    });
  });
});

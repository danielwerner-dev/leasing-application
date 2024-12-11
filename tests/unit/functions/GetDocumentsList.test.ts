import * as lambda from '$functions/GetDocumentsList';
import * as service from '$lib/services/GetDocumentsList';

jest.mock('$lib/services/GetDocumentsList', () => {
  return {
    listDocumentsService: jest.fn()
  };
});

describe('GetDocumentsList lambda tests', () => {
  describe('requestHandler', () => {
    let event: any;
    let application: any;
    beforeEach(() => {
      application = 'application';

      jest
        .spyOn(service, 'listDocumentsService')
        .mockResolvedValue('document-list' as any);
    });

    it('returns 200 on success', async () => {
      const res = await lambda.requestHandler(event, application, null as any);

      const expected = {
        statusCode: 200,
        body: JSON.stringify('document-list'),
        headers: { 'content-type': 'application/json' }
      };

      expect(res).toEqual(expected);
      expect(service.listDocumentsService).toHaveBeenCalledWith(application);
    });
  });
});

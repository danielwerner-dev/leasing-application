import * as lambda from '$functions/DeleteDocument';
import * as service from '$lib/services/DeleteDocument';
import { applicationFixture, eventFixture } from '$fixtures';

jest.mock('$lib/services/DeleteDocument', () => {
  return {
    deleteDocumentService: jest.fn()
  };
});

describe('DeleteDocument lambda tests', () => {
  describe('requestHandler', () => {
    let event: any;
    let application: any;
    let authContext: any;
    beforeEach(() => {
      event = eventFixture();
      application = applicationFixture();
      authContext = {};

      jest.spyOn(service, 'deleteDocumentService');
    });

    it('returns 204 on success', async () => {
      event.pathParameters = { documentId: 'document-id' };
      const res = await lambda.requestHandler(event, application, authContext);

      const expected = {
        statusCode: 204,
        body: '',
        headers: { 'content-type': 'application/json' }
      };

      expect(res).toEqual(expected);
      expect(service.deleteDocumentService).toHaveBeenCalledWith(
        application,
        'document-id'
      );
    });

    it('it throws if pathParameters are missing', async () => {
      event.pathParameters = {};
      await expect(
        lambda.requestHandler(event, application, authContext)
      ).rejects.toThrow();

      expect(service.deleteDocumentService).not.toHaveBeenCalled();
    });
  });
});

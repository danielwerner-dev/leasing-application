import { applicationFixture, eventFixture } from '$fixtures';
import * as lambda from '$functions/DeleteApplication';
import * as service from '$lib/services/DeleteApplication';

jest.mock('$lib/services/DeleteApplication', () => {
  return {
    deleteApplicationService: jest.fn()
  };
});

describe('DeleteApplication lambda tests', () => {
  describe('requestHandler', () => {
    let event: any;
    let application: any;
    let authContext: any;
    let body: any;
    beforeEach(() => {
      event = eventFixture();
      application = applicationFixture();
      authContext = {};
      body = { reason: 'testing' };

      jest.spyOn(service, 'deleteApplicationService');
    });

    it('returns 200 when cancelling successfully', async () => {
      event.body = JSON.stringify(body);
      const res = await lambda.requestHandler(event, application, authContext);

      const expected = {
        statusCode: 200,
        body: '',
        headers: { 'content-type': 'application/json' }
      };

      expect(res).toEqual(expected);
      expect(service.deleteApplicationService).toHaveBeenCalledWith(
        application,
        body.reason
      );
    });

    it('it throws if body is missing', async () => {
      event.body = null;

      await expect(
        lambda.requestHandler(event, application, authContext)
      ).rejects.toThrow();

      expect(service.deleteApplicationService).not.toHaveBeenCalled();
    });
  });
});

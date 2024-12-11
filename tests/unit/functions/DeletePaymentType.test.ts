import { applicationFixture } from '$fixtures';
import * as lambda from '$functions/DeletePaymentType';
import * as service from '$lib/services/DeletePaymentType';

jest.mock('$lib/services/DeletePaymentType', () => {
  return {
    deletePaymentTypeService: jest.fn()
  };
});

describe('DeleteApplication lambda tests', () => {
  describe('requestHandler', () => {
    let event: any;
    let application: any;
    let authContext: any;
    beforeEach(() => {
      event = null;
      application = applicationFixture();
      authContext = null;

      jest.spyOn(service, 'deletePaymentTypeService');
    });

    it('returns status 204 on success', async () => {
      const res = await lambda.requestHandler(event, application, authContext);

      const expected = {
        statusCode: 204,
        body: '',
        headers: { 'content-type': 'application/json' }
      };

      expect(res).toEqual(expected);
      expect(service.deletePaymentTypeService).toHaveBeenCalledWith(
        application
      );
    });
  });
});

import * as lambda from '$functions/PatchCoapplicantCustomer';
import * as service from '$lib/services/UpdateApplicationCustomer';
import * as uuid from 'uuid';

jest.mock('$lib/services/UpdateApplicationCustomer', () => {
  return {
    updateApplicationCustomerService: jest.fn()
  };
});

jest.mock('uuid', () => {
  return {
    validate: jest.fn()
  };
});

describe('PatchCoapplicantCustomer lambda tests', () => {
  describe('requestHandler', () => {
    let event: any;
    let application: any;
    beforeEach(() => {
      event = {
        body: {
          coapplicantApplicationId: 'coapplicant-application-id',
          email: 'email'
        }
      };
      application = 'application';

      jest.spyOn(service, 'updateApplicationCustomerService');
      jest.spyOn(uuid, 'validate').mockReturnValue(true);
    });

    it('returns 200 on success', async () => {
      const res = await lambda.requestHandler(event, application, null as any);

      const expected = {
        statusCode: 200,
        body: '',
        headers: { 'content-type': 'application/json' }
      };

      expect(res).toEqual(expected);
      expect(service.updateApplicationCustomerService).toHaveBeenCalledWith(
        application,
        'coapplicant-application-id',
        'email'
      );
    });

    it('throws if body is missing', async () => {
      event.body = null;
      await expect(
        lambda.requestHandler(event, application, null as any)
      ).rejects.toThrow();
    });
  });
});

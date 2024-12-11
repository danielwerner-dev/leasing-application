import * as lambda from '$functions/ProcessCustomerVerified';
import * as service from '$lib/services/UpdateCoapplicantCustomer';

jest.mock('$lib/services/UpdateCoapplicantCustomer', () => {
  return {
    UpdateCoapplicantCustomer: jest.fn()
  };
});

jest.mock('$lib/authorizer', () => {
  return {
    eventBridgeHandlerFactory: jest.fn()
  };
});

describe('ProcessCustomerVerified lambda tests', () => {
  describe('eventCallback', () => {
    let data: any;
    let event: any;
    beforeEach(() => {
      data = {
        customerId: 'customer-id',
        email: 'email'
      };
      event = {
        detail: {
          data
        }
      };

      jest.spyOn(service, 'UpdateCoapplicantCustomer');
    });

    it('calls UpdateCoapplicantCustomer', async () => {
      await lambda.eventCallback(event, null as any, null as any);

      expect(service.UpdateCoapplicantCustomer).toHaveBeenCalledWith(
        data.customerId,
        data.email
      );
    });

    it('throws a validation error if data is invalid', async () => {
      data.customerId = undefined;
      await expect(
        lambda.eventCallback(event, null as any, null as any)
      ).rejects.toThrow();
    });

    it('throws any other error logging the error', async () => {
      jest
        .spyOn(service, 'UpdateCoapplicantCustomer')
        .mockRejectedValue(new Error('testing error'));

      await expect(
        lambda.eventCallback(event, null as any, null as any)
      ).rejects.toThrowError('testing error');
    });
  });
});

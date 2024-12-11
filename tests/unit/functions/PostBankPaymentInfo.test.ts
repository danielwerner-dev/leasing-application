import * as lambda from '$functions/PostBankPaymentInfo';
import * as service from '$lib/services/CreateBankPaymentInfo';

jest.mock('$lib/services/CreateBankPaymentInfo', () => {
  return {
    createBankPaymentTypeService: jest.fn()
  };
});

describe('PostBankPaymentInfo tests', () => {
  describe('requestHandler', () => {
    let event: any;
    let application: any;
    let bankInfo: any;
    beforeEach(() => {
      application = 'application';
      bankInfo = {
        accountNumber: '1234',
        routingNumber: '1234',
        nameOnAccount: 'Billy Idol',
        accountType: 'checking'
      };
      event = {
        body: JSON.stringify(bankInfo)
      };

      jest.spyOn(service, 'createBankPaymentTypeService');
    });

    it('returns 200 on success', async () => {
      const res = await lambda.requestHandler(event, application, null as any);

      const expected = {
        statusCode: 201,
        body: '',
        headers: { 'content-type': 'application/json' }
      };

      expect(res).toEqual(expected);
      expect(service.createBankPaymentTypeService).toHaveBeenCalledWith(
        application,
        bankInfo
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

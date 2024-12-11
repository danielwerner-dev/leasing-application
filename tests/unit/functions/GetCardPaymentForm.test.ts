import { applicationFixture, eventFixture } from '$fixtures';
import * as lambda from '$functions/GetCardPaymentForm';
import * as service from '$lib/services/GetCardPaymentForm';

jest.mock('$lib/services/GetCardPaymentForm', () => {
  return {
    getCardPaymentFormService: jest.fn()
  };
});

describe('CompleteApplication lambda tests', () => {
  describe('requestHandler', () => {
    let event: any;
    let application: any;
    let authContext: any;
    beforeEach(() => {
      event = eventFixture();
      application = applicationFixture();
      authContext = {};

      jest
        .spyOn(service, 'getCardPaymentFormService')
        .mockResolvedValue('html for payment');
    });

    it('returns payment form on success', async () => {
      const postbackUrl = 'hello';
      const isCreditCard = 'false';
      event.queryStringParameters = { postbackUrl, isCreditCard };

      const res = await lambda.requestHandler(event, application, authContext);

      const expected = {
        statusCode: 201,
        body: JSON.stringify('html for payment')
      };

      expect(res).toEqual(expected);
      expect(service.getCardPaymentFormService).toHaveBeenCalledWith(
        application,
        postbackUrl,
        isCreditCard
      );
    });
  });
});

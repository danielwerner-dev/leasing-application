import * as lambda from '$functions/GetCustomerSummaries';
import * as service from '$lib/services/GetApplication';

jest.mock('$lib/services/GetApplication', () => {
  return {
    getApplicationsByCustomerId: jest.fn()
  };
});

describe('GetCustomerSummaries lambda tests', () => {
  describe('requestHandler', () => {
    let event: any;
    beforeEach(() => {
      event = {
        pathParameters: {
          customerId: 'customer-id'
        }
      };
      jest
        .spyOn(service, 'getApplicationsByCustomerId')
        .mockResolvedValue(['applications'] as any);
    });

    it('return 200 on success', async () => {
      const res = await lambda.requestHandler(event, null as any);

      const expected = {
        statusCode: 200,
        body: JSON.stringify({
          customerId: 'customer-id',
          applications: ['applications']
        }),
        headers: { 'content-type': 'application/json' }
      };

      expect(res).toEqual(expected);
      expect(service.getApplicationsByCustomerId).toHaveBeenCalledWith(
        'customer-id'
      );
    });
  });
});

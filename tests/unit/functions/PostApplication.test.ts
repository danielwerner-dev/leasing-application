import * as lambda from '$functions/PostApplication';
import * as service from '$lib/services/CreateApplication';

jest.mock('$lib/services/CreateApplication', () => {
  return {
    createApplicationService: jest.fn()
  };
});

jest.mock('$lib/connectors/pls', () => {
  return {
    getPropertyBySlug: jest.fn()
  };
});

describe('PostApplication lambda tests', () => {
  describe('requestHandler', () => {
    let event: any;
    let authContext: any;
    let propertySlug: any;
    let body: any;
    let ipAddress: string;
    beforeEach(() => {
      propertySlug = '123-garden-ave';
      body = {
        customer: {
          customerId: 'customer-id',
          email: 'email'
        },
        propertySlug: '123-garden-ave'
      };
      event = {
        headers: {
          'client-ip-address': '127.0.0.1'
        },
        body: JSON.stringify(body)
      };
      authContext = {
        customerId: 'customer-id'
      };
      ipAddress = '127.0.0.1';

      jest
        .spyOn(service, 'createApplicationService')
        .mockResolvedValue('created' as any);
    });

    it('returns 200 on success', async () => {
      const res = await lambda.requestHandler(event, authContext);

      const expected = {
        statusCode: 201,
        body: JSON.stringify('created'),
        headers: { 'content-type': 'application/json' }
      };

      expect(res).toEqual(expected);
      expect(service.createApplicationService).toHaveBeenCalledWith(
        body.customer,
        propertySlug,
        ipAddress
      );
    });

    it('throws if if body is missing', async () => {
      event.body = null;
      await expect(lambda.requestHandler(event, authContext)).rejects.toThrow();
    });

    it('throws error if no ip address exist in headers', async () => {
      event.headers['client-ip-address'] = undefined;
      await expect(lambda.requestHandler(event, null as any)).rejects.toThrow();
    });
  });
});

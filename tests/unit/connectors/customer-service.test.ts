import * as connector from '$lib/connectors/customer-service';

jest.mock('@invitation-homes/iam-axios', () => () => {
  return {
    get: jest.fn()
  };
});

describe('Customer service connector', () => {
  describe('getCustomerByEmail', () => {
    let customer: any;
    let resolvedData;
    beforeEach(() => {
      customer = {
        customerId: 'hello-world'
      };

      resolvedData = {
        total: 1,
        customers: [
          {
            customerId: 'hello-world'
          }
        ]
      };

      jest.spyOn(connector.iamAxios, 'get').mockResolvedValue({
        data: resolvedData
      });
    });

    it('returns customer if it exists', async () => {
      const path = `/admin/customers/search`;
      const res = await connector.getCustomerByEmail('email@test.com');

      expect(res).toEqual(customer);
      expect(connector.iamAxios.get).toHaveBeenCalledWith(path, {
        params: { email: 'email@test.com' }
      });
    });

    it('returns null if no customer is fetched', async () => {
      resolvedData.total = 0;

      const res = await connector.getCustomerByEmail('email@test.com');

      expect(res).toBe(null);
    });
  });
});

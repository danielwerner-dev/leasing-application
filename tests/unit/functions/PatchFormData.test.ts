import * as lambda from '$functions/PatchFormData';
import * as service from '$lib/services/UpdateFormData';

jest.mock('$lib/services/UpdateFormData', () => {
  return {
    updateFormDataService: jest.fn()
  };
});

describe('PatchFormData lambda tests', () => {
  describe('requestHandler', () => {
    let event: any;
    let application: any;
    let body: any;
    beforeEach(() => {
      body = {
        formData: {
          general: 'general'
        }
      };

      event = {
        headers: {
          'client-ip-address': '127.0.0.1'
        },
        body: JSON.stringify(body)
      };
      application = 'application';
      jest
        .spyOn(service, 'updateFormDataService')
        .mockResolvedValue('updated' as any);
    });

    it('returns 200 on success', async () => {
      const res = await lambda.requestHandler(event, application, null as any);

      const expected = {
        statusCode: 200,
        body: JSON.stringify('updated'),
        headers: { 'content-type': 'application/json' }
      };

      expect(res).toEqual(expected);
      expect(service.updateFormDataService).toHaveBeenCalledWith(
        application,
        {
          general: 'general'
        },
        event.headers['client-ip-address']
      );
    });

    it('throws if body is missing', async () => {
      event.body = null;
      await expect(
        lambda.requestHandler(event, application, null as any)
      ).rejects.toThrow();
    });

    it('throws error if no ip address exist in headers', async () => {
      event.headers['client-ip-address'] = undefined;
      await expect(
        lambda.requestHandler(event, application, null as any)
      ).rejects.toThrow('Ip Address is missing in headers');
    });
  });
});

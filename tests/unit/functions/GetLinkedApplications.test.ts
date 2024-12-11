import * as lambda from '$functions/GetLinkedApplications';
import * as service from '$lib/services/ListLinkedApplications';

jest.mock('$lib/services/ListLinkedApplications', () => {
  return {
    listLinkedApplications: jest.fn()
  };
});

describe('GetLinkedApplications lambda tests', () => {
  describe('requestHandler', () => {
    let event: any;
    let application: any;
    beforeEach(() => {
      application = 'application';

      jest
        .spyOn(service, 'listLinkedApplications')
        .mockResolvedValue('document-info' as any);
    });

    it('returns 200 on success', async () => {
      const res = await lambda.requestHandler(event, application, null as any);

      const expected = {
        statusCode: 200,
        body: JSON.stringify({ applications: 'document-info' }),
        headers: { 'content-type': 'application/json' }
      };

      expect(res).toEqual(expected);
      expect(service.listLinkedApplications).toHaveBeenCalledWith(application);
    });
  });
});

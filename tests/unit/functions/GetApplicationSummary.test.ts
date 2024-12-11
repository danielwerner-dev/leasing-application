import { applicationFixture, eventFixture } from '$fixtures';
import * as lambda from '$functions/GetApplicationSummary';
import * as service from '$lib/services/GetApplicationSummary';

jest.mock('$lib/services/GetApplicationSummary', () => {
  return {
    getApplicationPDFService: jest.fn()
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

      jest.spyOn(service, 'getApplicationPDFService').mockResolvedValue('pdf');
    });

    it('returns pdf content on success', async () => {
      const res = await lambda.requestHandler(event, application, authContext);

      const expected = {
        statusCode: 200,
        body: 'pdf',
        headers: { 'content-type': 'application/pdf' },
        isBase64Encoded: true
      };

      expect(res).toEqual(expected);
      expect(service.getApplicationPDFService).toHaveBeenCalledWith(
        application
      );
    });
  });
});

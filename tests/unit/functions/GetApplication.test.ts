import * as lambda from '$functions/GetApplication';
import * as service from '$lib/services/GetApplication';
import { applicationFixture } from '$fixtures';

jest.mock('$lib/services/GetApplication', () => {
  return {
    getUpdatedApplication: jest.fn()
  };
});

describe('GetApplication lambda tests', () => {
  describe('requestHandler', () => {
    let event: any;
    let application: any;
    let authContext: any;
    beforeEach(() => {
      event = null;
      application = applicationFixture();
      authContext = null;

      jest.spyOn(service, 'getUpdatedApplication').mockReturnValue(application);
    });

    it('return stringified application on success', async () => {
      const res = await lambda.requestHandler(event, application, authContext);

      const expected = {
        statusCode: 200,
        body: JSON.stringify(application),
        headers: { 'content-type': 'application/json' }
      };

      expect(res).toEqual(expected);
      expect(service.getUpdatedApplication).toHaveBeenCalledWith(application);
    });
  });
});

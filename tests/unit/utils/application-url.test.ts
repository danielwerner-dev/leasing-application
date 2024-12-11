import * as utils from '$lib/utils/application-url';

describe('Application URL tests', () => {
  let applicationId: any;
  beforeEach(() => {
    applicationId = 'application-id';
  });

  describe('getApplicationUrl', () => {
    it('throws if base URL is not defined', () => {
      expect(() => {
        utils.getApplicationUrl(applicationId);
      }).toThrowError('Leasing Application Base URL is required');
    });

    it('returns URL', () => {
      const baseUrl = 'https://www.invitationhomes.com/test';
      process.env.LEASING_APPLICATION_BASE_URL = baseUrl;

      const res = utils.getApplicationUrl(applicationId);

      expect(res).toEqual(`${baseUrl}/applications/${applicationId}`);
    });
  });
});

import * as utils from '$lib/utils/validate-application';

describe('validate-application utility function', () => {
  describe('isAllowedToCreateApplication', () => {
    let applications: any;
    let propertySlug: any;
    beforeEach(() => {
      applications = [
        {
          applicationStatus: 'approved',
          property: {
            slug: 'random-property'
          }
        }
      ];
      propertySlug = 'my-property';
    });

    it('returns `true` if no deal breaker is found', () => {
      expect(
        utils.isAllowedToCreateApplication(applications, propertySlug)
      ).toBe(true);
    });

    it('returns `false` if deal breaker is found', () => {
      applications = [
        {
          applicationStatus: 'draft',
          property: {
            slug: 'my-property'
          }
        }
      ];

      expect(
        utils.isAllowedToCreateApplication(applications, propertySlug)
      ).toBe(false);
    });
  });
});

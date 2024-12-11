import * as utils from '$lib/utils/form-validation';
import * as dateUtils from '$lib/utils/date';
import { applicationFixture } from '$fixtures';

jest.mock('$lib/utils/date', () => {
  return { getAllowedMoveInDateRange: jest.fn() };
});

describe('Form validation utils tests', () => {
  describe('getValidationContext', () => {
    let application: any;
    beforeEach(() => {
      application = applicationFixture();

      jest.spyOn(dateUtils, 'getAllowedMoveInDateRange').mockReturnValue({
        min: '2022-12-31',
        max: '2022-12-31'
      });
    });

    it('returns the context on success', () => {
      const res = utils.getValidationContext(application);

      const {
        property: { market, availableAt },
        applicationType,
        audit: { createdAt }
      } = application;

      const expectedRes = {
        market: market.slug,
        availableFrom: '2022-12-31',
        availableTo: '2022-12-31',
        leaseStartDate: '2022-09-14',
        leaseTerm: '12',
        applicationType,
        promoted: false
      };

      expect(res).toEqual(expectedRes);
      expect(dateUtils.getAllowedMoveInDateRange).toHaveBeenCalledWith(
        availableAt,
        createdAt
      );
    });
  });
});

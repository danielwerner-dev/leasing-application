import * as utils from '$lib/utils/phone';

describe('Phone utils tests', () => {
  describe('isPhoneInternational', () => {
    it('returns true for an international phone number (starting with "+")', () => {
      const res = utils.isPhoneInternational('+5512341234');
      expect(res).toEqual(true);
    });

    it('returns false for a US phone number (not starting with "+")', () => {
      const res = utils.isPhoneInternational('1234567890');
      expect(res).toEqual(false);
    });
  });
});

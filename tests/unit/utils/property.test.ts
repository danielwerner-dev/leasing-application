import * as utils from '$lib/utils/property';

describe('Property utils tests', () => {
  describe('parsePuCode', () => {
    it('returns and object with property and unit code', () => {
      const res = utils.parsePuCode('1234-4321');

      const expected = {
        propertyCode: '1234',
        unitCode: '4321'
      };

      expect(res).toEqual(expected);
    });

    it('throws if puCode is not well formated', () => {
      expect(() => utils.parsePuCode('abcddcba')).toThrow();
      expect(() => utils.parsePuCode('1111111')).toThrow();
    });
  });
});

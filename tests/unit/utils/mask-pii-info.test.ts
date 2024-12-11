import { maskPiiInfo } from '$lib/utils/mask-pii-info';
describe('Mask Pii Info', () => {
  it('should return "-" with empty string', () => {
    const string = '';
    const expectedValue = '-';
    const res = maskPiiInfo(string, 5);

    expect(res).toEqual(expectedValue);
  });
  it('should return original string when length is less or equal to 4 digits', () => {
    const string = '123';
    const expectedValue = '123';
    const res = maskPiiInfo(string);

    expect(res).toEqual(expectedValue);
  });
  it('should return masked info with correct string length', () => {
    const string = '123456789';
    const expectedValue = '*****6789';
    const res = maskPiiInfo(string);

    expect(res).toEqual(expectedValue);
  });
  it('should return masked info with more than 4 digits', () => {
    const string = '123456789';
    const expectedValue = '****56789';
    const res = maskPiiInfo(string, 5);

    expect(res).toEqual(expectedValue);
  });

  it('should return masked info with less than 4 digits', () => {
    const string = '1234';
    const expectedValue = '***4';
    const res = maskPiiInfo(string, 1);

    expect(res).toEqual(expectedValue);
  });
});

import { concatenateAddress } from '$lib/utils/concatenate-address';

describe('Concatenated Address', () => {
  it('should return undefined when address1 is undefined', () => {
    const address1 = undefined;
    const address2 = '123456789';
    const limit = 20;
    const expectedValue = undefined;

    const res = concatenateAddress(address1, address2, limit);
    expect(res).toEqual(expectedValue);
  });
  it('should return address1 when address2 is undefined', () => {
    const limit = 20;
    const address1 = '123456789';
    const address2 = undefined;
    const expectedValue = '123456789';

    const res = concatenateAddress(address1, address2, limit);
    expect(res).toEqual(expectedValue);
  });
  it('should return concatenated addresses', () => {
    const limit = 20;
    const address1 = '1234567890';
    const address2 = '9876543210';
    const expectedValue = '1234567890 987654321';

    const res = concatenateAddress(address1, address2, limit);
    expect(res).toEqual(expectedValue);
  });
});

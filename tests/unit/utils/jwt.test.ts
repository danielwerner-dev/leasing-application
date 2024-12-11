import * as utils from '$lib/utils/jwt';
import * as jwtDecode from 'jwt-decode';

jest.mock('jwt-decode');

describe('JWT utils', () => {
  describe('decodeJwt', () => {
    let event: any;
    beforeEach(() => {
      event = {
        headers: {
          authorization: 'my token'
        }
      };

      jest.spyOn(jwtDecode, 'default').mockImplementation((value) => value);
    });

    it('returns unchanged token if it does not start with Bearer', () => {
      const res = utils.decodeJwt(event);

      expect(res).toEqual(event.headers.authorization);
      expect(jwtDecode.default).toHaveBeenCalledWith(
        event.headers.authorization
      );
    });

    it('removes `Bearer ` if authorization starts with it', () => {
      event.headers.authorization = 'Bearer my token';
      const res = utils.decodeJwt(event);

      expect(res).toEqual('my token');
      expect(jwtDecode.default).toHaveBeenCalledWith('my token');
    });

    it('returns empty object is authorization is empty', () => {
      event.headers.authorization = undefined;

      const res = utils.decodeJwt(event);

      expect(res).toEqual({});
    });
  });
});

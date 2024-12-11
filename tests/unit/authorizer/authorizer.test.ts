import * as authorizer from '$lib/authorizer';
import * as errorUtils from '$lib/utils/errors';
import * as jwtutils from '$lib/utils/jwt';
import * as repo from '$lib/repositories/leasing-application/read-application';
import * as uuid from 'uuid';
import { BadRequestError } from '$lib/types/errors';
import { AuthContext } from '$lib/types/authorizer.types';

jest.mock('uuid', () => {
  return {
    validate: jest.fn()
  };
});

jest.mock('$lib/repositories/leasing-application/read-application', () => {
  return {
    getApplication: jest.fn()
  };
});

jest.mock('$lib/utils/jwt', () => {
  return {
    decodeJwt: jest.fn()
  };
});

jest.mock('$lib/utils/errors', () => {
  return {
    errorToResponse: jest.fn(),
    logError: jest.fn()
  };
});

describe('Authorizer tests', () => {
  describe('authorizeLeasingApplicationAccess', () => {
    let event: any;
    let callback: any;
    beforeEach(() => {
      event = 'event-test';
      callback = 'callback-test';

      jest.spyOn(authorizer, 'authorizeIdentity');
      jest
        .spyOn(authorizer, 'applicationAccessCallback')
        .mockReturnValue('test-access' as any);
    });

    it('calls authorizeIdentity and applicationAccessCallback', async () => {
      await authorizer.authorizeLeasingApplicationAccess(event, callback);

      expect(authorizer.authorizeIdentity).toHaveBeenCalledWith(
        event,
        'test-access'
      );
      expect(authorizer.applicationAccessCallback).toHaveBeenCalledWith(
        callback
      );
    });
  });

  describe('applicationAccessCallback', () => {
    let event: any;
    let callback: any;
    let authContext: any;
    let accessCallback: any;
    let application: any;
    beforeEach(() => {
      callback = jest.fn();
      accessCallback = authorizer.applicationAccessCallback(callback);
      event = { pathParameters: { applicationId: 'application-id' } };
      authContext = { customerId: 'customer-id' };
      application = { customer: { customerId: 'customer-id' } };

      jest.spyOn(repo, 'getApplication').mockResolvedValue(application);
      jest.spyOn(uuid, 'validate').mockReturnValue(true);
    });

    it('calls the callback on success', async () => {
      await accessCallback(event, authContext);

      expect(callback).toHaveBeenCalledWith(event, application, authContext);
      expect(uuid.validate).toHaveBeenCalledWith('application-id');
      expect(repo.getApplication).toHaveBeenCalledWith('application-id');
    });

    it('throws if pathParamerter is missing applicationId', async () => {
      event.pathParameters = {};
      await expect(accessCallback(event, authContext)).rejects.toThrow();
    });

    it('throws if applicaitonId is not a valid uuid', async () => {
      jest.spyOn(uuid, 'validate').mockReturnValue(false);
      await expect(accessCallback(event, authContext)).rejects.toThrow();
    });

    it('throws if no application is returned from repo', async () => {
      jest.spyOn(repo, 'getApplication').mockResolvedValue(null);
      await expect(accessCallback(event, authContext)).rejects.toThrow();
    });

    it('throws if customer id from application does not match customer id from authContext', async () => {
      authContext.customerId = 'bad-customer';
      await expect(accessCallback(event, authContext)).rejects.toThrow();
    });
  });

  describe('authorizeIdentity', () => {
    let event: any;
    let callback: any;
    beforeEach(() => {
      event = { headers: { authorization: 'authorization' } };
      callback = jest.fn();

      jest.spyOn(authorizer, 'validateToken');
      jest.spyOn(errorUtils, 'errorToResponse');
    });

    it('calls validateToken on success', async () => {
      await authorizer.authorizeIdentity(event, callback);
      expect(authorizer.validateToken).toHaveBeenCalledWith(event, callback);
    });

    it('calls errorToResponse if authorization is missing', async () => {
      event.headers = {};
      await authorizer.authorizeIdentity(event, callback);

      expect(authorizer.validateToken).not.toHaveBeenCalled();
      expect(errorUtils.errorToResponse).toHaveBeenCalledWith(
        new BadRequestError('Customer token not available for authorization')
      );
    });
  });

  describe('validateToken', () => {
    let event: any;
    let callback: any;
    let decoded: any;
    beforeEach(() => {
      event = 'event-test';
      callback = jest.fn();
      decoded = {
        customerId: 'customer-id',
        'cognito:username': 'cognito-id'
      };

      jest.spyOn(jwtutils, 'decodeJwt').mockReturnValue(decoded);
    });

    it('calls the callback on success', async () => {
      await authorizer.validateToken(event, callback);

      const authContext = new AuthContext(
        decoded.customerId,
        decoded['cognito:username']
      );

      expect(callback).toHaveBeenCalledWith(event, authContext);
    });

    it('returns 401 when customer id is missing', async () => {
      decoded.customerId = null;
      const res = await authorizer.validateToken(event, callback);

      const expected = {
        statusCode: 401,
        body: JSON.stringify({
          message: 'Token is missing customerId claim'
        })
      };

      expect(res).toEqual(expected);
      expect(callback).not.toHaveBeenCalled();
    });

    it('returns 401 when cognito:username is missing', async () => {
      decoded['cognito:username'] = null;
      const res = await authorizer.validateToken(event, callback);

      const expected = {
        statusCode: 401,
        body: JSON.stringify({
          message: 'Token is missing username claim'
        })
      };

      expect(res).toEqual(expected);
      expect(callback).not.toHaveBeenCalled();
    });
  });
});

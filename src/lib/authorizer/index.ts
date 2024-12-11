import logger from '$lib/utils/logger';
import { validate as validateUUID } from 'uuid';

import { getApplication } from '$lib/repositories/leasing-application/read-application';

import { decodeJwt } from '$lib/utils/jwt';
import { errorToResponse } from '$lib/utils/errors';

import { BadRequestError, ForbiddenError } from '$lib/types/errors';
import {
  ApplicationAccess,
  ApplicationAuthorizer,
  AuthContext,
  IdentityAuthorizer
} from '$lib/types/authorizer.types';
import { object, string } from 'yup';

export const authorizeLeasingApplicationAccess: ApplicationAuthorizer = async (
  event,
  callback
) => {
  return authorizeIdentity(event, applicationAccessCallback(callback));
};

export const applicationAccessCallback: ApplicationAccess = (callback) => {
  return async (event, authContext) => {
    const preconditions = object({
      applicationId: string()
        .required('Could not find application id in path')
        .test('validate-uuid', 'Invalid application id', function (value) {
          if (!validateUUID(value)) {
            return this.createError({
              message: `${value} is not a valid application id`
            });
          }

          return true;
        })
    }).required();

    const { applicationId } = preconditions.validateSync(event.pathParameters);

    const customerId = authContext.customerId;

    const application = await getApplication(applicationId);

    if (!application) {
      throw new BadRequestError(`Invalid application id "${applicationId}"`);
    }

    if (application.customer.customerId !== customerId) {
      throw new ForbiddenError('Access Forbidden.');
    }

    logger.info(`Access granted for application id: ${applicationId}`);

    return callback(event, application, authContext);
  };
};

export const authorizeIdentity: IdentityAuthorizer = async (
  event,
  callback
) => {
  try {
    if (!event.headers.authorization) {
      throw new BadRequestError(
        `Customer token not available for authorization`
      );
    }

    return await validateToken(event, callback);
  } catch (err) {
    return errorToResponse(err);
  }
};

export const validateToken: IdentityAuthorizer = async (event, callback) => {
  const decoded = decodeJwt(event);

  const customerIdClaim = decoded.customerId;
  if (!customerIdClaim) {
    return {
      statusCode: 401,
      body: JSON.stringify({
        message: 'Token is missing customerId claim'
      })
    };
  }

  const usernameClaim = decoded['cognito:username'];
  if (!usernameClaim) {
    return {
      statusCode: 401,
      body: JSON.stringify({
        message: 'Token is missing username claim'
      })
    };
  }

  logger.info(`Identity confirmed for customer id: ${customerIdClaim}`);

  const authContext = new AuthContext(customerIdClaim, usernameClaim);
  return await callback(event, authContext);
};

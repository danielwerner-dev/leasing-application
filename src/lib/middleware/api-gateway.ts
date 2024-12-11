import {
  authorizeIdentity,
  authorizeLeasingApplicationAccess
} from '$lib/authorizer';
import {
  ApplicationHandlerFactory,
  IdentityHandlerFactory
} from '$lib/types/middleware.types';
import { CasingPattern, jsonCasingParser } from '$lib/utils/json-casing-parser';

export const applicationHandlerFactory: ApplicationHandlerFactory =
  (callback) => async (event) => {
    if (event.pathParameters) {
      const parsedPathParameters = jsonCasingParser(
        event.pathParameters,
        CasingPattern.CAMEL
      );

      event.pathParameters = parsedPathParameters;
    }

    if (event.body) {
      const parsedBody = jsonCasingParser(event.body, CasingPattern.CAMEL);
      event.body = parsedBody;
    }

    const res = await authorizeLeasingApplicationAccess(event, callback);
    if (res && typeof res !== 'string' && res.body) {
      const parsedResBody = jsonCasingParser(res.body, CasingPattern.SNAKE);
      res.body = parsedResBody;
    }

    return res;
  };

export const identityHandlerFactory: IdentityHandlerFactory =
  (callback) => async (event) => {
    if (event.pathParameters) {
      const parsedPathParameters = jsonCasingParser(
        event.pathParameters,
        CasingPattern.CAMEL
      );

      event.pathParameters = parsedPathParameters;
    }

    if (event.body) {
      const parsedBody = jsonCasingParser(event.body, CasingPattern.CAMEL);
      event.body = parsedBody;
    }

    const res = await authorizeIdentity(event, callback);

    if (res && typeof res !== 'string' && res.body) {
      const parsedResBody = jsonCasingParser(res.body, CasingPattern.SNAKE);
      res.body = parsedResBody;
    }

    return res;
  };

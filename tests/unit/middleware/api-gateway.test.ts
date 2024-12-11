import * as middleware from '$lib/middleware/api-gateway';
import * as authorizer from '$lib/authorizer';
import * as casingParser from '$lib/utils/json-casing-parser';

jest.mock('$lib/authorizer', () => {
  return {
    authorizeLeasingApplicationAccess: jest.fn(),
    authorizeIdentity: jest.fn()
  };
});

jest.mock('$lib/utils/json-casing-parser', () => {
  return {
    toSnakeCase: jest.fn(),
    toCamelCase: jest.fn(),
    jsonCasingParser: jest.fn(),
    CasingPattern: {}
  };
});

describe('applicationHandlerFactory', () => {
  let callback: any;
  let body: any;
  let pathParameters: any;
  beforeEach(() => {
    callback = jest.fn();
    body = JSON.stringify({ hello: 'world' });
    pathParameters = { application_id: 'test-route' };

    jest
      .spyOn(authorizer, 'authorizeLeasingApplicationAccess')
      .mockResolvedValue({ body });
  });

  it('returns a handler function', async () => {
    const event: any = { body, pathParameters };
    const handler = middleware.applicationHandlerFactory(callback);
    await handler(event, null as any, null as any);

    expect(casingParser.jsonCasingParser).toHaveBeenCalled();
    expect(authorizer.authorizeLeasingApplicationAccess).toHaveBeenCalledWith(
      event,
      callback
    );
  });
});

describe('identityHandlerFactory', () => {
  let callback: any;
  let body: any;
  let pathParameters: any;
  beforeEach(() => {
    callback = jest.fn();
    body = JSON.stringify({ hello: 'world' });
    pathParameters = { customer_id: 'hello' };

    jest.spyOn(authorizer, 'authorizeIdentity').mockResolvedValue({ body });
  });

  it('returns a handler function', async () => {
    const event: any = { body, pathParameters };

    const handler = middleware.identityHandlerFactory(callback);
    await handler(event, null as any, null as any);

    expect(casingParser.jsonCasingParser).toHaveBeenCalled();
    expect(authorizer.authorizeIdentity).toHaveBeenCalledWith(event, callback);
  });
});

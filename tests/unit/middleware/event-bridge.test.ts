import * as middleware from '$lib/middleware/event-bridge';
import * as casingParser from '$lib/utils/json-casing-parser';
import { string } from 'yup';

jest.mock('$lib/utils/json-casing-parser', () => {
  return {
    toSnakeCase: jest.fn(),
    toCamelCase: jest.fn(),
    jsonCasingParser: jest.fn(),
    CasingPattern: {}
  };
});

describe('eventBridgeHandlerFactory', () => {
  let callback: any;
  let data: any;
  let event: any;
  beforeEach(() => {
    callback = jest.fn();
    data = JSON.stringify({ hello: 'world' });
    event = { detail: { data } };
  });

  it('returns a handler function', async () => {
    const handler = middleware.eventBridgeHandlerFactory(callback);
    await handler(event, null as any, null as any);

    expect(casingParser.jsonCasingParser).toHaveBeenCalled();
    expect(callback).toHaveBeenCalledWith(event, null, null);
  });

  it('logs errors for ValidationError', async () => {
    callback = jest
      .fn()
      .mockImplementation(() => string().required().validateSync(''));

    const handler = middleware.eventBridgeHandlerFactory(callback);
    await expect(handler(event, null as any, null as any)).rejects.toThrow();

    expect(callback).toHaveBeenCalled();
  });

  it('logs errors when not ValidationErrors', async () => {
    const error = new Error('test');
    callback = jest.fn().mockRejectedValue(error);

    const handler = middleware.eventBridgeHandlerFactory(callback);
    await expect(handler(event, null as any, null as any)).rejects.toThrow();

    expect(callback).toHaveBeenCalled();
  });
});

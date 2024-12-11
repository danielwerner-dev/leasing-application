import * as utils from '$lib/utils/errors';
import logger from '$lib/utils/logger';

import { AxiosError } from 'axios';
import { object, string, ValidationError } from 'yup';
import { BadRequestError, ForbiddenError } from '$lib/types/errors';

jest.mock('$lib/utils/logger', () => {
  return {
    error: jest.fn()
  };
});

describe('Errors utils tests', () => {
  describe('axiosLogger', () => {
    let axiosError: any;
    let response: any;
    let config: any;
    beforeEach(() => {
      config = {
        baseURL: 'https://hello-world.com',
        url: '/say-hello',
        method: 'get'
      };

      response = {
        status: 400,
        statusText: 'Bad request',
        data: JSON.stringify({ message: 'Invalid data' })
      };

      axiosError = new AxiosError();
      axiosError.config = config;
    });

    describe('when there is no response', () => {
      it('logs failed to complete request with baseURL, url, and method', () => {
        const log = utils.axiosLogger(axiosError);

        expect(log).toEqual({
          baseURL: 'https://hello-world.com',
          url: '/say-hello',
          method: 'get'
        });
      });

      it('logs "N/A" when property does not exists on config', () => {
        axiosError.config = undefined;

        const log = utils.axiosLogger(axiosError);

        expect(log).toEqual({ baseURL: 'N/A', url: 'N/A', method: 'N/A' });
      });
    });

    describe('when there is a response', () => {
      beforeEach(() => {
        axiosError.response = response;
      });

      it('logs the response data correctly parsed', () => {
        const log = utils.axiosLogger(axiosError);

        expect(log).toEqual({
          data: response.data,
          baseURL: 'https://hello-world.com',
          url: '/say-hello',
          method: 'get',
          status: 400,
          statusText: 'Bad request'
        });
      });
    });
  });

  describe('validatorLogger', () => {
    it('returns the error paths and errors for abortEarly equals true', () => {
      try {
        object({
          hello: string().required(),
          world: string().required()
        }).validateSync({}, { abortEarly: false });
      } catch (err) {
        const res = utils.validatorLogger(err as any);

        expect(res).toEqual({
          errors: [
            { errors: ['hello is a required field'], path: 'hello' },
            { errors: ['world is a required field'], path: 'world' }
          ]
        });
      }
    });

    it('returns the error paths and errors for abortEarly equals false', () => {
      try {
        object({
          hello: string().required(),
          world: string().required()
        }).validateSync({});
      } catch (err) {
        const res = utils.validatorLogger(err as any);

        expect(res).toEqual({
          errors: ['world is a required field'],
          path: 'world'
        });
      }
    });
  });

  describe('customErrorLogger', () => {
    const error = new ForbiddenError('hello world');
    const res = utils.customErrorLogger(error);

    expect(res).toEqual({
      name: 'ForbiddenError',
      statusCode: 403
    });
  });

  describe('logError', () => {
    beforeEach(() => {
      jest
        .spyOn(utils, 'axiosLogger')
        .mockReturnValue({ test: 'test', test2: 'test2' } as any);
      jest
        .spyOn(utils, 'validatorLogger')
        .mockReturnValue({ test: 'test', test2: 'test2' } as any);
      jest
        .spyOn(utils, 'customErrorLogger')
        .mockReturnValue({ test: 'test', test2: 'test2' } as any);
    });

    it('calls axiosLogger for AxiosError', () => {
      const error = new AxiosError();

      utils.logError('test', error);

      expect(utils.axiosLogger).toHaveBeenCalledWith(error);
      expect(logger.error).toHaveBeenCalled();
    });

    it('calls validatorLogger for ValidationError', () => {
      let error: any;
      try {
        object({
          hello: string().required(),
          world: string().required()
        }).validateSync({});
      } catch (err) {
        error = err;
      }

      utils.logError('test', error);

      expect(utils.validatorLogger).toHaveBeenCalledWith(error);
      expect(logger.error).toHaveBeenCalled();
    });
    it('calls customErrorLogger for customError', () => {
      const error = new ForbiddenError('message');
      utils.logError('test', error);

      expect(utils.customErrorLogger).toHaveBeenCalledWith(error);
      expect(logger.error).toHaveBeenCalled();
    });

    it('logs generic Error', () => {
      const error = new TypeError('test generic error');
      utils.logError('test', error);

      expect(logger.error).toHaveBeenCalled();
    });

    it('logs errors as string', () => {
      utils.logError('test', 'test error as string');

      expect(logger.error).toHaveBeenCalled();
    });

    it('logs errors in JSON format', () => {
      const error = { canLog: 'as object' };
      utils.logError('test', error);

      expect(logger.error).toHaveBeenCalled();
    });

    it('logs unknown errors', () => {
      jest.spyOn(JSON, 'stringify').mockImplementation((value: any) => {
        throw new Error(value);
      });
      utils.logError('test', { iWillBreak: 'JSON.stringify' });

      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('errorToResponse', () => {
    beforeEach(() => {
      jest.spyOn(utils, 'logError').mockImplementation(jest.fn());
    });
    describe('when error is a CustomError', () => {
      it('returns the error statusCode and message', () => {
        const error = new BadRequestError('testing error');
        const res = utils.errorToResponse(error);

        const expected = {
          statusCode: 400,
          body: JSON.stringify({ message: 'testing error' })
        };

        expect(res).toEqual(expected);
        expect(utils.logError).toHaveBeenCalledWith(
          'utils.errors.errorToResponse',
          error
        );
      });
    });

    describe('when error is a ValidationError', () => {
      it('returns statusCode 400 and message `Invalid data`', () => {
        const error = new ValidationError('testing validation error');
        const res = utils.errorToResponse(error);

        const expected = {
          statusCode: 400,
          body: JSON.stringify({
            message: 'Invalid data'
          })
        };

        expect(res).toEqual(expected);
      });
    });

    describe('ValidationError', () => {
      it('returns statusCode 400 and message `Invalid characters`', () => {
        const error = new ValidationError('Invalid characters');
        const res = utils.errorToResponse(error);

        const expected = {
          statusCode: 400,
          body: JSON.stringify({
            message: 'Invalid characters'
          })
        };

        expect(res).toEqual(expected);
      });
    });

    describe('when error is a AxiosError', () => {
      let error: any;
      beforeEach(() => {
        error = new AxiosError();

        jest.spyOn(utils, 'axiosLogger').mockImplementation(jest.fn());
      });

      describe('and there is no response', () => {
        it('returns 500 response', () => {
          const res = utils.errorToResponse(error);

          const expected = {
            statusCode: 500,
            body: JSON.stringify({
              message: 'Internal error'
            })
          };

          expect(res).toEqual(expected);
        });
      });

      it('returns response data and statusCode if it exists', () => {
        error.response = {
          status: 403,
          data: JSON.stringify({ message: 'axios error' })
        } as any;

        const res = utils.errorToResponse(error);

        const expected = {
          statusCode: 403,
          body: JSON.stringify({ message: 'axios error' })
        };

        expect(res).toEqual(expected);
      });

      it('returns statusCode 500 and `Internal error` if response does not exists', () => {
        const error = new AxiosError();
        error.response = null as any;
        error.request = { hello: 'world' } as any;

        const res = utils.errorToResponse(error);

        const expected = {
          statusCode: 500,
          body: JSON.stringify({ message: 'Internal error' })
        };

        expect(res).toEqual(expected);
      });
    });

    describe('when error is unknown', () => {
      it('returns status 500 and message `Internal error`', () => {
        const error = new Error('unknown error');

        const res = utils.errorToResponse(error);

        const expected = {
          statusCode: 500,
          body: JSON.stringify({
            message: 'Internal error'
          })
        };

        expect(res).toEqual(expected);
      });
    });
  });
});

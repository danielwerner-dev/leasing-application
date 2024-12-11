import { APIGatewayProxyResult } from 'aws-lambda';
import { ValidationError } from 'yup';
import { AxiosError, isAxiosError } from 'axios';

import { CustomError } from '$lib/types/errors';
import logger from './logger';

export const axiosLogger = (error: AxiosError) => {
  const { config = {}, response } = error;
  const { baseURL = 'N/A', url = 'N/A', method = 'N/A' } = config;

  const axiosContext = {
    baseURL,
    url,
    method
  };

  if (response) {
    const { status, statusText, data } = response;

    return {
      ...axiosContext,
      status,
      statusText,
      data
    };
  }

  return axiosContext;
};

export const validatorLogger = (error: ValidationError) => {
  if (error.inner.length) {
    return {
      errors: error.inner.map(({ errors, path }) => {
        return { errors, path };
      })
    };
  }

  return {
    errors: error.errors,
    path: error.path
  };
};

export const customErrorLogger = (error: CustomError) => {
  return {
    name: error.constructor.name,
    statusCode: error.statusCode
  };
};

export const logError = (caller: string, error: unknown) => {
  let logMessage = '';
  let logContext: Record<string, unknown> = {
    caller
  };

  if (error instanceof Error) {
    const { name, stack, message } = error;
    logMessage = message;
    logContext = {
      name,
      stack
    };

    if (isAxiosError(error)) {
      logContext = {
        ...logContext,
        ...axiosLogger(error)
      };
    }

    if (error instanceof ValidationError) {
      logContext = {
        ...logContext,
        ...validatorLogger(error)
      };
    }

    if (error instanceof CustomError) {
      logContext = {
        ...logContext,
        ...customErrorLogger(error)
      };
    }
  } else if (typeof error === 'string') {
    logMessage = error;
  } else {
    logMessage = 'Not possible to identify error type';
    logContext = {
      ...logContext,
      error
    };
  }

  logger.error(logMessage, logContext);
};

export const errorToResponse = (error: unknown): APIGatewayProxyResult => {
  logError('utils.errors.errorToResponse', error);
  let validationErrorMessage = 'Invalid data';

  if (error instanceof CustomError) {
    return {
      statusCode: error.statusCode,
      body: JSON.stringify({
        message: error.message
      })
    };
  } else if (error instanceof ValidationError) {
    if (error.errors.includes('Invalid characters')) {
      validationErrorMessage = 'Invalid characters';
    }

    return {
      statusCode: 400,
      body: JSON.stringify({
        message: validationErrorMessage
      })
    };
  } else if (error instanceof AxiosError) {
    if (!error.response) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Internal error' })
      };
    }

    const {
      response: { data, status }
    } = error;

    return {
      statusCode: status,
      body: data
    };
  } else {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Internal error'
      })
    };
  }
};

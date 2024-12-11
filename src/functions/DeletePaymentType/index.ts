import { Handler } from 'aws-lambda';

import { applicationHandlerFactory } from '$lib/middleware/api-gateway';

import { deletePaymentTypeService } from '$lib/services/DeletePaymentType';
import { LeasingApplicationAccessCallback } from '$lib/types/authorizer.types';

export const requestHandler: LeasingApplicationAccessCallback = async (
  _event,
  application
) => {
  await deletePaymentTypeService(application);

  return {
    statusCode: 204,
    body: '',
    headers: { 'content-type': 'application/json' }
  };
};

export const handler: Handler = applicationHandlerFactory(requestHandler);

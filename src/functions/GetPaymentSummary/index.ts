import { Handler } from 'aws-lambda';
import { applicationHandlerFactory } from '$lib/middleware/api-gateway';
import { getPaymentSummaryService } from '$lib/services/GetPaymentSummary';
import { LeasingApplicationAccessCallback } from '$lib/types/authorizer.types';

export const requestHandler: LeasingApplicationAccessCallback = async (
  _event,
  application
) => {
  const paymentSummary = await getPaymentSummaryService(application);

  return {
    statusCode: 200,
    body: JSON.stringify(paymentSummary),
    headers: { 'content-type': 'application/json' }
  };
};

export const handler: Handler = applicationHandlerFactory(requestHandler);

import { Handler } from 'aws-lambda';
import { mixed, object, string } from 'yup';

import { applicationHandlerFactory } from '$lib/middleware/api-gateway';

import { getCardPaymentFormService } from '$lib/services/GetCardPaymentForm';
import { LeasingApplicationAccessCallback } from '$lib/types/authorizer.types';

export const requestHandler: LeasingApplicationAccessCallback = async (
  event,
  application
) => {
  const preconditions = object({
    postbackUrl: string().required('Missing postbackUrl'),
    isCreditCard: mixed<'true' | 'false'>()
      .required('Missing isCreditCard')
      .oneOf(['true', 'false'])
  }).required();

  const { postbackUrl, isCreditCard } = preconditions.validateSync(
    event.queryStringParameters
  );

  const paymentFormHtmlScript = await getCardPaymentFormService(
    application,
    postbackUrl,
    isCreditCard
  );

  return {
    statusCode: 201,
    body: JSON.stringify(paymentFormHtmlScript)
  };
};

export const handler: Handler = applicationHandlerFactory(requestHandler);

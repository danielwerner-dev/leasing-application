import { Handler } from 'aws-lambda';
import { processApplicationService } from '$lib/services/ProcessApplication';
import { LeasingApplicationAccessCallback } from '$lib/types/authorizer.types';
import { applicationHandlerFactory } from '$lib/middleware/api-gateway';
import { array, number, object, string } from 'yup';
export const requestHandler: LeasingApplicationAccessCallback = async (
  event,
  application
) => {
  const headerConditions = string().required(
    'Ip Address is missing in headers'
  );

  const ipAddress = headerConditions.validateSync(
    event.headers['client-ip-address']
  );

  const authorization = event.headers?.authorization || '';

  const paymentPreconditions = object({
    amountToPay: number()
      .typeError('Not a valid amount')
      .required('Amount paid is required'),
    applicantsToPay: array(
      string().email('Not a valid email address').required()
    ).required('Applicants to pay is required')
  });

  const { amountToPay, applicantsToPay } = paymentPreconditions.validateSync(
    JSON.parse(event.body || '')
  );

  await processApplicationService(
    application,
    applicantsToPay,
    amountToPay,
    ipAddress,
    authorization
  );

  return {
    statusCode: 200,
    body: '',
    headers: { 'content-type': 'application/json' }
  };
};

export const handler: Handler = applicationHandlerFactory(requestHandler);

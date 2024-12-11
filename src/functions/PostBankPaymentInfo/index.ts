import { Handler } from 'aws-lambda';
import { applicationHandlerFactory } from '$lib/middleware/api-gateway';
import { createBankPaymentTypeService } from '$lib/services/CreateBankPaymentInfo';
import { object, string } from 'yup';
import { LeasingApplicationAccessCallback } from '$lib/types/authorizer.types';

export const requestHandler: LeasingApplicationAccessCallback = async (
  event,
  application
) => {
  const preconditions = object({
    accountNumber: string()
      .required('Request missing account number')
      .typeError('Provided account number is invalid'),
    routingNumber: string()
      .required('Request missing routing number')
      .typeError('Provided routing number is invalid'),
    nameOnAccount: string()
      .required('Request missing name on account')
      .min(5, 'Minimum 5 characters')
      .max(42, 'Maximum 42 characters')
      .matches(/^([A-Za-z]+\s?)*$/, 'Maximum 42 characters, only letters'),
    accountType: string()
      .required('Request missing account type')
      .oneOf(['checking', 'savings'])
  }).required('Empty request');

  const bankInfo = preconditions.validateSync(JSON.parse(event.body || ''));

  await createBankPaymentTypeService(application, bankInfo);

  return {
    statusCode: 201,
    body: '',
    headers: { 'content-type': 'application/json' }
  };
};

export const handler: Handler = applicationHandlerFactory(requestHandler);

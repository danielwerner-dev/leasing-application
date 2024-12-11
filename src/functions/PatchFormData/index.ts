import { Handler } from 'aws-lambda';
import { applicationHandlerFactory } from '$lib/middleware/api-gateway';
import { updateFormDataService } from '$lib/services/UpdateFormData';
import { Application } from '$lib/types/Application.types';
import { LeasingApplicationAccessCallback } from '$lib/types/authorizer.types';
import { object, string } from 'yup';

export const requestHandler: LeasingApplicationAccessCallback = async (
  event,
  application: Application
) => {
  const preconditions = object({
    formData: object().required('Empty form data')
  }).required('Empty request');

  const { formData } = preconditions.validateSync(JSON.parse(event.body || ''));

  const headerConditions = string().required(
    'Ip Address is missing in headers'
  );

  const ipAddress = headerConditions.validateSync(
    event.headers['client-ip-address']
  );

  const updatedApplicationData = await updateFormDataService(
    application,
    formData,
    ipAddress
  );
  return {
    statusCode: 200,
    body: JSON.stringify(updatedApplicationData),
    headers: { 'content-type': 'application/json' }
  };
};

export const handler: Handler = applicationHandlerFactory(requestHandler);

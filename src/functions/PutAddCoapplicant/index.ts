import { Handler } from 'aws-lambda';
import { applicationHandlerFactory } from '$lib/middleware/api-gateway';
import { LeasingApplicationAccessCallback } from '$lib/types/authorizer.types';
import { object, string } from 'yup';
import { BadRequestError, ConflictError } from '$lib/types/errors';
import { addCoapplicantService } from '$lib/services/AddCoapplicant';
import { ApplicationType } from '$lib/types/Application.types';
import { listLinkedApplications } from '$lib/services/ListLinkedApplications';

export const requestHandler: LeasingApplicationAccessCallback = async (
  event,
  application
) => {
  const preconditions = object({
    coapplicant: object({
      firstName: string().required(),
      lastName: string().required(),
      type: string().required(),
      email: string().required(),
      id: string().required()
    }).required('Missing coapplicant data')
  }).required('Empty request');

  const { coapplicant } = preconditions.validateSync(
    JSON.parse(event.body || '')
  );

  const ipAddress = event.headers['client-ip-address'];

  if (!ipAddress) {
    throw new BadRequestError(
      'Ip Address not found or provided in request headers'
    );
  }

  if (application.applicationType !== ApplicationType.primary) {
    throw new BadRequestError('Coapplicants cannot add new coapplicants');
  }

  const linkedApplications = await listLinkedApplications(application);
  const duplicatedCoapplicant = !!linkedApplications.find(
    (linkedApplication) => {
      return linkedApplication.customer.email === coapplicant.email;
    }
  );

  if (duplicatedCoapplicant) {
    throw new ConflictError('Duplicated coapplicant');
  }

  const res = await addCoapplicantService(application, coapplicant, ipAddress);

  return {
    statusCode: 200,
    body: JSON.stringify({
      ...res
    }),
    headers: { 'content-type': 'application/json' }
  };
};

export const handler: Handler = applicationHandlerFactory(requestHandler);

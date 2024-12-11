import { getApplication } from '$lib/repositories/leasing-application/read-application';
import {
  updateApplicationExistingCustomer,
  updateApplicationNewCustomer,
  updateApplicationStatus
} from '$lib/repositories/leasing-application/update-application';

import {
  ConflictError,
  ForbiddenError,
  NotFoundError
} from '$lib/types/errors';
import {
  Application,
  ApplicationStatus,
  ApplicationType
} from '$lib/types/Application.types';
import { getCustomerByEmail } from '$lib/connectors/customer-service';

import { emailCoapplicantInvite } from './EmailCoapplicantInvite';
import { logError } from '$lib/utils/errors';

export const updateApplicationCustomerService = async (
  primaryApplication: Application,
  coapplicantApplicationId: string,
  email: string
) => {
  const coapplicantApplication = await getApplication(coapplicantApplicationId);

  if (!coapplicantApplication) {
    throw new NotFoundError('Co-applicant application not found');
  }

  if (
    coapplicantApplication?.primaryApplicationId !==
    primaryApplication.applicationId
  ) {
    const { applicationId: primaryId } = primaryApplication;
    const { applicationId: coapplicantId } = coapplicantApplication;
    logError(
      'services.UpdateApplicationCustomers.updateApplicationCustomerService',
      `Application ${coapplicantId} is not co-applicant of application ${primaryId}`
    );
    throw new ForbiddenError('Forbidden');
  }

  if (primaryApplication.applicationType !== ApplicationType.primary) {
    const { applicationId: id } = primaryApplication;
    logError(
      'services.UpdateApplicationCustomer.updateApplicationCustomerService',
      `Application ${id} is not primary`
    );
    throw new ForbiddenError('Forbidden');
  }

  if (
    [
      ApplicationStatus.deleted,
      ApplicationStatus.draft,
      ApplicationStatus.created
    ].includes(primaryApplication.applicationStatus)
  ) {
    const { applicationId: id, applicationStatus: status } = primaryApplication;
    logError(
      'services.UpdateApplicationCustomer.updateApplicationCustomerService',
      `Application ${id} has status of ${status}`
    );
    throw new ForbiddenError('Forbidden');
  }

  if (coapplicantApplication.applicationType !== ApplicationType.coapplicant) {
    const { applicationId: id } = coapplicantApplication;
    logError(
      'services.UpdateApplicationCustomer.updateApplicationCustomerService',
      `Application ${id} is not a co-applicant`
    );
    throw new ForbiddenError('Forbidden');
  }

  if (coapplicantApplication.applicationStatus !== ApplicationStatus.created) {
    const { applicationId: id } = coapplicantApplication;
    throw new ConflictError(`Application ${id} is not a created application`);
  }

  const customer = await getCustomerByEmail(email);

  if (customer) {
    await updateApplicationExistingCustomer(
      coapplicantApplicationId,
      customer.customerId,
      email
    );
    await updateApplicationStatus(
      coapplicantApplicationId,
      ApplicationStatus.draft
    );
  } else {
    await updateApplicationNewCustomer(coapplicantApplicationId, email);
  }

  const updatedCoapplicantApplication = {
    ...coapplicantApplication,
    customer: { customerId: coapplicantApplication.customer.customerId, email }
  };
  await emailCoapplicantInvite(
    primaryApplication,
    updatedCoapplicantApplication
  );
};

import logger from '$lib/utils/logger';
import { submit } from '$lib/services/Submission';
import { updatePaidByIdTransaction } from '$lib/repositories/leasing-application/update-application';
import { validateFormData } from '$lib/form-validation/validator';
import { getValidationContext } from '$lib/utils/form-validation';
import { validatePaymentAmount } from '$lib/utils/payment-amount';

import { BadRequestError } from '$lib/types/errors';
import { Application, ApplicationStatus } from '$lib/types/Application.types';
import validatePaymentData from '$lib/utils/validate-payment-data';
import { listCoapplicantApplications } from '$lib/repositories/leasing-application/read-application';
import { TransactionType } from '$lib/types/repository.types';

export const processApplicationService = async (
  application: Application,
  applicantsToPay: string[],
  amountToPay: number,
  ipAddress: string,
  authorization: string
) => {
  logger.info(`Processing application ${application.applicationId}`);
  if (application.applicationStatus !== ApplicationStatus.draft) {
    throw new BadRequestError(
      `Invalid status to process application. Status: ${application.applicationStatus} Application id: ${application.applicationId}`
    );
  }

  const context = getValidationContext(application);
  if (!validateFormData(application.formData, context)) {
    throw new BadRequestError(
      `Form data is not valid to process. Application id: ${application.applicationId}`
    );
  }

  validatePaymentData(application, applicantsToPay);
  validatePaymentAmount(
    application.property.market.slug,
    applicantsToPay,
    amountToPay,
    application
  );

  const linkedApplications = await listCoapplicantApplications(
    application.primaryApplicationId,
    { includePrimary: true }
  );
  const paidApplications = linkedApplications.filter((application) =>
    applicantsToPay.includes(application.customer.email)
  );

  await updatePaidByIdTransaction(
    paidApplications,
    application.customer.customerId,
    TransactionType.FAIL_WHEN_EXISTS
  );

  try {
    await submit(application, {
      amountToPay,
      authorization,
      applicantsToPay,
      ipAddress
    });
  } catch (err) {
    logger.info(`rolling back paidByIds: ${application.applicationId}}`);
    await updatePaidByIdTransaction(
      paidApplications,
      '',
      TransactionType.OVERWRITE
    );

    throw err;
  }
};

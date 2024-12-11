import logger from '$lib/utils/logger';
import {
  updateApplicationExistingCustomer,
  updateApplicationStatus
} from '$lib/repositories/leasing-application/update-application';
import { listApplicationByEmail } from '$lib/repositories/leasing-application/read-application';
import { ApplicationStatus } from '$lib/types/Application.types';
import { logError } from '$lib/utils/errors';

export const UpdateCoapplicantCustomer = async (
  customerId: string,
  email: string
) => {
  const applications = await listApplicationByEmail(email);

  const promises = applications.map(async (application) => {
    logger.info(
      `Updating customerId: ${customerId} for application: ${application.applicationId}`
    );
    try {
      await updateApplicationExistingCustomer(
        application.applicationId,
        customerId,
        email
      );

      if (application.applicationStatus === ApplicationStatus.created) {
        logger.info(
          `Updating applicationStatus: ${ApplicationStatus.draft} for application: ${application.applicationId}`
        );
        await updateApplicationStatus(
          application.applicationId,
          ApplicationStatus.draft
        );
      }
    } catch (err) {
      logError(
        'services.UpdateCoapplicantCustomer.UpdateCoapplicantCustomer',
        `Error updating application: ${application.applicationId} with customerId: ${customerId}`
      );

      logError(
        'services.UpdateCoapplicantCustomer.UpdateCoapplicantCustomer',
        err
      );
    }
  });

  await Promise.all(promises);
};

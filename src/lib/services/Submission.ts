import logger from '$lib/utils/logger';
import {
  updateApplicationStartSubmission,
  updateApplicationSubmissionStatus,
  updateCompletedApplication
} from '$lib/repositories/leasing-application/update-application';
import { createCoapplicantApplications } from '$lib/services/CreateCoapplicant';
import {
  Application,
  ApplicationType,
  SubmissionStatus
} from '$lib/types/Application.types';
import { YardiCoapplicant } from '$lib/types/yardi.types';
import { submitToYardiService } from '$lib/services/SubmitToYardi';
import { logError } from '$lib/utils/errors';

interface SubmissionData {
  amountToPay: number;
  authorization: string;
  applicantsToPay: string[];
  ipAddress: string;
}

export const finalizeSubmission = async (
  application: Application,
  applicantsToPay: string[],
  amountPaid: number,
  ipAddress: string,
  coapplicants: YardiCoapplicant[]
) => {
  logger.info(
    `Finalizing submission for application: ${application.applicationId}]`
  );
  const paymentMethod =
    application.integrationData.yardi?.paymentInfo?.paymentType || '';

  const completedApplication = await updateCompletedApplication(
    application.applicationId,
    {
      amountPaid,
      paymentMethod
    }
  );

  const hasCoapplicants =
    application.formData?.coapplicants?.coapplicants?.length;
  const isPrimary = application.applicationType === ApplicationType.primary;

  if (isPrimary && hasCoapplicants) {
    await createCoapplicantApplications(
      completedApplication,
      applicantsToPay,
      ipAddress,
      coapplicants
    );
  }
};

export const submit = async (
  application: Application,
  { amountToPay, authorization, applicantsToPay, ipAddress }: SubmissionData
) => {
  try {
    await updateApplicationStartSubmission(application, ipAddress);

    const submission = await submitToYardiService(
      application,
      amountToPay,
      authorization,
      ipAddress
    );

    await finalizeSubmission(
      application,
      applicantsToPay,
      amountToPay,
      ipAddress,
      submission.coapplicants
    );
  } catch (err) {
    logError('services.Submission.submit', 'Error submitting to yardi.');
    await updateApplicationSubmissionStatus(application, SubmissionStatus.FAIL);
    throw err;
  }
};

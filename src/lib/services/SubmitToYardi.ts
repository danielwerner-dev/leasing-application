import logger from '$lib/utils/logger';
import {
  createApplicant,
  deleteApplicant,
  submitApplication
} from '$lib/connectors/yardi-service';

import { parseYardiPayload } from '$lib/parsers/yardi/yardi-submit.parser';

import {
  YardiGuestCard,
  YardiApplicationSubmissionResponse,
  YardiApplicant,
  YardiCoapplicant
} from '$lib/types/yardi.types';
import { Application, ApplicationType } from '$lib/types/Application.types';
import { ConflictError, InternalServerError } from '$lib/types/errors';
import {
  deleteApplicationSummariesFromS3,
  getSubmissionDocuments
} from '$lib/services/YardiDocumentService';
import { logError } from '$lib/utils/errors';

export const submitToYardiService = async (
  application: Application,
  amountPaid: number,
  authorization: string,
  ipAddress: string
): Promise<YardiApplicationSubmissionResponse> => {
  logger.info(
    `[SubmitToYardiService] application: ${application.applicationId}`
  );
  const documents = await getSubmissionDocuments(application, authorization);
  const yardiPayload: YardiGuestCard = parseYardiPayload(
    application,
    amountPaid,
    ipAddress,
    documents
  );

  if (!application.integrationData.yardi) {
    throw new ConflictError(
      `Application does not have Yardi information. Application ${application.applicationId}`
    );
  }

  const guestcardId = application.integrationData.yardi.guestcardId;
  const applicantId = application.integrationData.yardi.applicantId;

  let createdCoapplicants: YardiCoapplicant[] = [];
  if (application.applicationType === ApplicationType.primary) {
    createdCoapplicants = await createCoapplicantsWithRollback(application);
  }

  logger.debug('Submitting to yardi', { yardiPayload });

  try {
    const res = await submitApplication(guestcardId, applicantId, yardiPayload);

    const submissionResponse: YardiApplicationSubmissionResponse = await {
      ...res,
      coapplicants: createdCoapplicants
    };

    return submissionResponse;
  } catch (err) {
    logError(
      'services.SubmitToyardi.submitToYardiService',
      'Error submitting application to Yardi'
    );

    await deleteCoapplicants(
      application.property.propertyCode,
      guestcardId,
      createdCoapplicants
    );

    await deleteApplicationSummariesFromS3(
      application.applicationId,
      documents
    );

    throw err;
  }
};

const createCoapplicantsWithRollback = async (
  primaryApplication: Application
): Promise<YardiCoapplicant[]> => {
  logger.info(
    `[createCoapplicantsWithRollback] application: ${primaryApplication.applicationId}}`
  );
  const guestcardId = primaryApplication.integrationData?.yardi?.guestcardId;
  const propertyCode = primaryApplication.property.propertyCode;
  const coapplicants =
    primaryApplication.formData.coapplicants?.coapplicants || [];

  const createdCoapplicants: YardiCoapplicant[] = [];

  if (!guestcardId) {
    throw new InternalServerError('No guestcard id found for application');
  }

  try {
    for (const coapplicant of coapplicants) {
      const applicant: YardiApplicant = {
        type: coapplicant.type,
        isLessee: true,
        audit: {
          submittedAt: new Date().toISOString()
        },
        contactDetails: {
          firstName: coapplicant.firstName,
          lastName: coapplicant.lastName,
          email: coapplicant.email
        },
        residences: []
      };
      const res = await createApplicant(propertyCode, guestcardId, applicant);

      const applicantId = res.applicants[0].applicantId;
      createdCoapplicants.push({ ...coapplicant, applicantId });
    }

    return createdCoapplicants;
  } catch (err) {
    logError(
      'services.SubmitToYardi.createCoapplicantsWithRollback',
      'Error creating coapplications rolling back'
    );

    await deleteCoapplicants(propertyCode, guestcardId, createdCoapplicants);

    throw err;
  }
};

const deleteCoapplicants = async (
  propertyCode: string,
  guestcardId: string,
  coapplicants: YardiCoapplicant[]
) => {
  logger.info(`[deleteCoapplicants] Guestcard id: ${guestcardId}}`);
  for (const coapplicant of coapplicants) {
    try {
      await deleteApplicant(propertyCode, guestcardId, coapplicant.applicantId);
    } catch (err) {
      logError(
        'services.SubmitToYardi.deleteCoapplicants',
        `Error deleting coapplication ${coapplicant.applicantId} continuing with additional deletions`
      );
      logError('services.SubmitToYardi.deleteCoapplicants', err);
    }
  }
};

import { listApplicationsByGuestcard } from '$lib/repositories/leasing-application/read-application';
import { updatePromotedApplication } from '$lib/repositories/leasing-application/update-application';
import {
  promoteApplicantTransactionItem,
  updatePrimaryApplicationTransactionItem
} from '$lib/repositories/leasing-application/transaction-items';

import { yardiBasicInfoSchema } from '$lib/form-validation/schemas/integration-data/yardi-integration-data.schema';

import { NewApplicantPayload } from '$lib/types/yardi.types';
import { Application, ApplicationType } from '$lib/types/Application.types';
import { ConflictError } from '$lib/types/errors';

interface ApplicantInfo {
  application: Application;
  applicantId: string;
}

interface PromotedPayload {
  promotedInfo: ApplicantInfo;
  otherApplicantsInfo: ApplicantInfo[];
}

export const updateApplicants = async (
  originalGuestcardId: string,
  newGuestcardId: string,
  newApplicantsYardiInfo: NewApplicantPayload[]
) => {
  const applicationsByApplicantId: Record<string, Application> =
    await listApplicationsByGuestcard(originalGuestcardId).then(
      (applications) =>
        applications
          .filter(
            ({ applicationType }) => applicationType !== ApplicationType.primary
          )
          .reduce((applications, application) => {
            const { applicantId } = yardiBasicInfoSchema.validateSync(
              application.integrationData.yardi
            );

            return {
              ...applications,
              [applicantId]: application
            };
          }, {})
    );

  const { promotedInfo, otherApplicantsInfo } =
    await getPromotedApplicationInfo(
      newApplicantsYardiInfo,
      applicationsByApplicantId,
      newGuestcardId
    );

  const promotedTransaction = promoteApplicantTransactionItem(
    promotedInfo.application,
    { guestcardId: newGuestcardId, applicantId: promotedInfo.applicantId }
  );

  const otherApplicantsTransctions = otherApplicantsInfo.map(
    (applicantInfo) => {
      return updatePrimaryApplicationTransactionItem(
        applicantInfo.application,
        {
          guestcardId: newGuestcardId,
          applicantId: applicantInfo.applicantId,
          promotedApplicationId: promotedInfo.application.applicationId
        }
      );
    }
  );

  await updatePromotedApplication([
    promotedTransaction,
    ...otherApplicantsTransctions
  ]);
};

export const getPromotedApplicationInfo = (
  newApplicantsYardiInfo: NewApplicantPayload[],
  applicationsByApplicantId: Record<string, Application>,
  newGuestcardId: string
): PromotedPayload => {
  const promotedPayload = newApplicantsYardiInfo.reduce<{
    promotedInfo: ApplicantInfo | null;
    otherApplicantsInfo: ApplicantInfo[];
  }>(
    ({ promotedInfo, otherApplicantsInfo }, applicant) => {
      const applicantInfo: ApplicantInfo = {
        application: applicationsByApplicantId[applicant.originalApplicantId],
        applicantId: applicant.newApplicantId
      };

      if (applicantInfo.applicantId === newGuestcardId) {
        return {
          otherApplicantsInfo,
          promotedInfo: applicantInfo
        };
      }

      return {
        promotedInfo,
        otherApplicantsInfo: [...otherApplicantsInfo, applicantInfo]
      };
    },
    { promotedInfo: null, otherApplicantsInfo: [] }
  );

  if (!promotedPayload.promotedInfo) {
    throw new ConflictError('No applicant is set to be promoted');
  }

  return promotedPayload as PromotedPayload;
};

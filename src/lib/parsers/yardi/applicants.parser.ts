import { Application, ApplicationType } from '$lib/types/Application.types';
import {
  GuestCardType,
  YardiApplicant,
  YardiDocument
} from '$lib/types/yardi.types';
import { getDateOnly } from '$lib/utils/date';
import { getYardiNotes } from '$lib/utils/get-notes-section';
import getYardiIntegrationData from '$lib/utils/get-yardi-integration-data';
import { parseContactDetailsToYardi } from './contact-details.parser';
import { parsePersonalDetailsToYardi } from './personal-details.parser';
import { parseResidenceToYardi } from './residences.parser';

export const parseApplicantsToYardi = (
  application: Application,
  amountPaid: number,
  ipAddress: string,
  documents: YardiDocument[]
) => {
  return [
    parsePrimaryApplicantToYardi(application, amountPaid, ipAddress, documents)
  ];
};

export const parseApplicantTypeToYardi = (
  application: Application
): GuestCardType => {
  let applicantType;
  if (application.applicationType === ApplicationType.primary) {
    applicantType = GuestCardType.prospect;
  } else {
    applicantType = application.formData.general?.applicationType;
  }
  return applicantType;
};

export const parsePrimaryApplicantToYardi = (
  application: Application,
  amountPaid: number,
  ipAddress: string,
  documents: YardiDocument[]
): YardiApplicant => {
  const yardiIntegrationData = getYardiIntegrationData(application);

  return {
    type: parseApplicantTypeToYardi(application),
    isLessee: true,
    applicantId: application.integrationData?.yardi?.applicantId,
    audit: {
      submittedAt: new Date().toISOString()
    },
    contactDetails: parseContactDetailsToYardi(application),
    residences: parseResidenceToYardi(application),
    personalDetails: parsePersonalDetailsToYardi(application, documents),
    userIpAddress: ipAddress,
    createDate: getDateOnly(application.audit.createdAt),
    payment: amountPaid,
    paymentType: yardiIntegrationData.paymentInfo.paymentType || undefined,
    payerId: yardiIntegrationData.paymentInfo.payerId ?? undefined,
    notes: getYardiNotes(application)
  };
};

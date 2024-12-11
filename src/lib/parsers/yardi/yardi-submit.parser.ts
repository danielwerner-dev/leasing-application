import { Application } from '$lib/types/Application.types';
import { YardiDocument } from '$lib/types/yardi.types';
import { parseApplicantsToYardi } from './applicants.parser';
import { parseApplicationDataToYardi } from './application-data.parser';
import { parsePropertyToYardi } from './property.parser';

export const parseYardiPayload = (
  application: Application,
  amountPaid: number,
  ipAddress: string,
  documents: YardiDocument[]
) => {
  return {
    property: parsePropertyToYardi(application),
    applicationData: parseApplicationDataToYardi(application),
    applicants: parseApplicantsToYardi(
      application,
      amountPaid,
      ipAddress,
      documents
    )
  };
};

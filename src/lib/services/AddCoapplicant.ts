import logger from '$lib/utils/logger';
import { postCoapplicant } from '$lib/connectors/yardi-service';
import { Application } from '$lib/types/Application.types';
import { Coapplicant } from '$lib/types/form-data/coapplicants.types';
import { parseCoapplicantToYardi } from '$lib/utils/guestcard';
import { array, object, string } from 'yup';
import { createCoapplicantService } from './CreateCoapplicant';

export const addCoapplicantService = async (
  primaryApplication: Application,
  coapplicant: Coapplicant,
  ipAddress: string
) => {
  const primaryGuestcardId = string()
    .required(
      'Primary application must have a guestcard in order to add a coapplicant'
    )
    .validateSync(primaryApplication.integrationData.yardi?.guestcardId);

  const yardiCoapplicant = parseCoapplicantToYardi(coapplicant);

  logger.info(
    `Adding coapplicant to application ${primaryApplication.applicationId}. Applicant id: ${yardiCoapplicant.applicantId}`
  );

  const res = await postCoapplicant(
    primaryApplication.property.propertyCode,
    primaryGuestcardId,
    yardiCoapplicant
  );

  const validateResponse = object({
    guestcardId: string().required(),
    applicants: array(
      object({
        applicantId: string().required()
      })
    )
      .required()
      .min(1)
  }).required();

  const applicantData = validateResponse.validateSync(res);

  const yardiInfo = {
    applicantId: applicantData.applicants[0].applicantId,
    guestcardId: applicantData.guestcardId
  };

  return await createCoapplicantService(
    primaryApplication,
    coapplicant,
    ipAddress,
    yardiInfo
  );
};

import logger from '$lib/utils/logger';
import { NotFoundError } from '$lib/types/errors';
import { Application } from '$lib/types/Application.types';
import {
  EmailTemplateParameters,
  EmailTemplates
} from '$lib/types/email-delivery-service.types';
import { getPrimaryApplicantName } from '$lib/utils/get-primary-applicant-name';
import { sendEmail } from '$lib/connectors/email-service';
import { getCoapplicantName } from '$lib/utils/get-coapplicant-name';
import { getApplicationUrl } from '$lib/utils/application-url';

export const emailCoapplicantInvite = async (
  primaryApplication: Application,
  coapplicantApplication: Application
) => {
  logger.info(
    `[EmailCoapplicantInvite] primaryApplication: ${primaryApplication.applicationId}`
  );
  if (!coapplicantApplication) {
    throw new NotFoundError('Application required to send coapplicant invite');
  }

  const templateParameters = getTemplateParameters(
    primaryApplication,
    coapplicantApplication
  );

  const res = await sendEmail(
    EmailTemplates.COAPPLICANT_INVITATION,
    coapplicantApplication.customer.email,
    templateParameters
  );

  logger.info(`[EmailCoapplicantInvite] messageId: ${res.messageId}`);
};

export const getTemplateParameters = (
  primaryApplication: Application,
  coapplicantApplication: Application
): EmailTemplateParameters[] => {
  return [
    {
      key: 'primary_applicant_name',
      value: getPrimaryApplicantName(primaryApplication)
    },
    {
      key: 'co_applicant_name',
      value: getCoapplicantName(coapplicantApplication)
    },
    {
      key: 'property_address',
      value: coapplicantApplication.property.address1
    },
    {
      key: 'application_url',
      value: getApplicationUrl(coapplicantApplication.applicationId)
    }
  ];
};

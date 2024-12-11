import { Application, ApplicationType } from '$lib/types/Application.types';
import { yardiCompleteInfoSchema } from '$lib/form-validation/schemas/integration-data/yardi-integration-data.schema';

const getYardiIntegrationData = (application: Application) => {
  let yardiIntegrationData;

  const isPrimaryApplicant =
    application.applicationType === ApplicationType.primary;
  const isCoapplicant =
    application.applicationType === ApplicationType.coapplicant;
  const hasPaymentType = application.integrationData.yardi?.paymentInfo;
  const isPaidFor = application.paidById;

  if (isPrimaryApplicant) {
    yardiIntegrationData = yardiCompleteInfoSchema.validateSync(
      application.integrationData?.yardi
    );
  }

  if (isCoapplicant && !isPaidFor) {
    yardiIntegrationData = yardiCompleteInfoSchema.validateSync(
      application.integrationData?.yardi
    );
  }

  if (isCoapplicant && isPaidFor) {
    yardiIntegrationData = {
      paymentInfo: {
        paymentType: '',
        payerId: ''
      }
    };
  }

  if (isCoapplicant && isPaidFor && hasPaymentType) {
    yardiIntegrationData = yardiCompleteInfoSchema.validateSync(
      application.integrationData?.yardi
    );
  }
  return yardiIntegrationData;
};

export default getYardiIntegrationData;

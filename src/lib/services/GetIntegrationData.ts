import logger from '$lib/utils/logger';
import { listApplicationDocuments } from '$lib/connectors/s3';
import { getPaymentTypes } from '$lib/connectors/yardi-service';

import { Application, IntegrationData } from '$lib/types/Application.types';

export const getFiles = async (
  applicationId: string
): Promise<Application['integrationData']['files']> => {
  return await listApplicationDocuments(applicationId);
};

export const getYardiInfo = async (
  application: Application
): Promise<IntegrationData['yardi']> => {
  const {
    integrationData: { yardi }
  } = application;

  if (yardi?.awaitingPaymentInfo) {
    logger.info('Fetching payment info from Yardi Service');
    const paymentTypes = await getPaymentTypes(application);

    if (paymentTypes?.length) {
      logger.info('Payment type found.');
      return {
        ...yardi,
        awaitingPaymentInfo: false,
        paymentInfo: paymentTypes[0]
      };
    } else {
      logger.info('No payment type returned from Yardi Service');
    }
  }

  return yardi;
};

export const getIntegrationData = async (
  application: Application
): Promise<IntegrationData> => {
  const filesPromise = getFiles(application.applicationId);
  const yardiPromise = getYardiInfo(application);

  const [files, yardi] = await Promise.all([filesPromise, yardiPromise]);

  return { files, yardi };
};

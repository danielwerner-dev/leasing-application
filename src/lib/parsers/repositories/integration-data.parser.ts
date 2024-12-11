import {
  DynamoDBIntegrationData,
  IntegrationData
} from '$lib/types/Application.types';

export const parseToDB = (
  integrationData: IntegrationData
): DynamoDBIntegrationData => {
  const yardi = integrationData.yardi;

  const dbIntegrationData: DynamoDBIntegrationData = {
    ...integrationData
  };

  if (yardi) {
    const { guestcardId, applicantId, ...rest } = yardi;
    dbIntegrationData.yardi = {
      ...rest
    };
  }

  return dbIntegrationData;
};

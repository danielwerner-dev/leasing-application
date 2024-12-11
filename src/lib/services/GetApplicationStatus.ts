import { Application, ApplicationStatus } from '$lib/types/Application.types';
import { getGuestcardStatus } from '$lib/connectors/yardi-service';
import { yardiBasicInfoSchema } from '$lib/form-validation/schemas/integration-data/yardi-integration-data.schema';

export const getApplicationStatus = async (
  application: Application
): Promise<ApplicationStatus> => {
  const {
    yardiOwned,
    property: { propertyCode },
    integrationData: { yardi }
  } = application;

  if (!yardiOwned) {
    return application.applicationStatus;
  }

  const { guestcardId } = yardiBasicInfoSchema.validateSync(yardi);
  const guestcardStatus = await getGuestcardStatus(guestcardId, propertyCode);

  return guestcardStatus;
};

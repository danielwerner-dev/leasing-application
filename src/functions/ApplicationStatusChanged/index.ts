import logger from '$lib/utils/logger';
import { eventBridgeHandlerFactory } from '$lib/middleware/event-bridge';
import { setYardiOwned } from '$lib/services/SetYardiOwned';
import { string, object } from 'yup';
import { EventBridgeCallback } from '$lib/types/middleware.types';

const preconditions = object({
  applicationStatusChangedResults: object({
    guestcardId: string().required(),
    status: string().required().oneOf(['Approved', 'Canceled', 'Denied'])
  })
});

export const eventCallback: EventBridgeCallback<
  'ApplicationStatusChanged Event'
> = async (event) => {
  const { data } = event.detail;
  const {
    applicationStatusChangedResults: { guestcardId, status }
  } = preconditions.validateSync(data, { abortEarly: false });

  logger.info(`Status changed for guestcard: ${guestcardId}: ${status}`);

  await setYardiOwned(guestcardId);
};

export const handler = eventBridgeHandlerFactory(eventCallback);

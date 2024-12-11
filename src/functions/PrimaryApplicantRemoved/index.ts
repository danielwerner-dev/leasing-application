import logger from '$lib/utils/logger';
import { updateApplicants } from '$lib/services/RemovePrimaryApplicant';
import { string, object, array } from 'yup';
import { eventBridgeHandlerFactory } from '$lib/middleware/event-bridge';
import { EventBridgeCallback } from '$lib/types/middleware.types';

const preconditions = object({
  applicationPromotionResults: object({
    originalGuestcardId: string().required(),
    newGuestcardId: string().required(),
    applicants: array(
      object({
        originalApplicantId: string().required(),
        newApplicantId: string().required()
      })
    ).required()
  }).required()
}).required();

export const eventCallback: EventBridgeCallback<
  'PrimaryApplicantRemoved Event'
> = async (event) => {
  const { data } = event.detail;
  const { applicationPromotionResults: results } = preconditions.validateSync(
    data,
    { abortEarly: false }
  );

  logger.info(
    `Removing Primary Application for guestcard: ${results.originalGuestcardId}`,
    { results }
  );

  const { originalGuestcardId, newGuestcardId, applicants } = results;

  await updateApplicants(originalGuestcardId, newGuestcardId, applicants);
};

export const handler = eventBridgeHandlerFactory(eventCallback);

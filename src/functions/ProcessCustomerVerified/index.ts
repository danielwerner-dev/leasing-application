import logger from '$lib/utils/logger';
import { UpdateCoapplicantCustomer } from '$lib/services/UpdateCoapplicantCustomer';
import { object, string } from 'yup';
import { eventBridgeHandlerFactory } from '$lib/middleware/event-bridge';
import { EventBridgeCallback } from '$lib/types/middleware.types';

const preconditions = object({
  customerId: string().required(),
  email: string().required()
});

export const eventCallback: EventBridgeCallback<
  'CustomerVerified Event'
> = async (event) => {
  const { data } = event.detail;
  const { customerId, email } = preconditions.validateSync(data);
  logger.info(`Processing customer verified for customer ID: ${customerId}`);

  await UpdateCoapplicantCustomer(customerId, email);
};

export const handler = eventBridgeHandlerFactory(eventCallback);

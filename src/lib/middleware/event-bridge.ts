import { EventBridgeHandlerFactory } from '$lib/types/middleware.types';
import { logError } from '$lib/utils/errors';
import { CasingPattern, jsonCasingParser } from '$lib/utils/json-casing-parser';

export const eventBridgeHandlerFactory: EventBridgeHandlerFactory =
  (callback) => async (event, context, next) => {
    try {
      if (event.detail.data) {
        event.detail.data = jsonCasingParser(
          event.detail.data,
          CasingPattern.CAMEL
        );
      }

      return await callback(event, context, next);
    } catch (err) {
      logError('Error on Lambda execution', err);

      throw err;
    }
  };

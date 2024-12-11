import {
  applicationFixture,
  authContextFixture,
  eventFixture
} from '$fixtures';
import { requestHandler } from '$functions/GetPaymentSummary';
import * as service from '$lib/services/GetPaymentSummary';
import { applicationSummaryFixture } from '$fixtures/application-summary';

describe('Get PaymentSummary', () => {
  describe('Request Handler', () => {
    it('calls Payment Summary Service', async () => {
      jest
        .spyOn(service, 'getPaymentSummaryService')
        .mockResolvedValueOnce(applicationSummaryFixture());

      await requestHandler(
        eventFixture(),
        applicationFixture(),
        authContextFixture()
      );

      expect(service.getPaymentSummaryService).toHaveBeenCalled();
    });
  });
});

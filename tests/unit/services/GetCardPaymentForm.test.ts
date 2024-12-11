import * as yardiService from '$lib/connectors/yardi-service';
import * as integrationDataService from '$lib/services/UpdateIntegrationData';
import * as guestcardUtils from '$lib/utils/guestcard';
import * as service from '$lib/services/GetCardPaymentForm';
import { applicationFixture } from '$fixtures';

jest.mock('$lib/connectors/yardi-service', () => {
  return {
    getCardPaymentForm: jest.fn()
  };
});

jest.mock('$lib/services/UpdateIntegrationData', () => {
  return {
    updateAwaitingPaymentInfo: jest.fn()
  };
});

jest.mock('$lib/utils/guestcard', () => {
  return {
    validateGuestcardData: jest.fn()
  };
});

describe('Get Card Payment Form Service', () => {
  describe('getCardPaymentFormService', () => {
    let application;
    let postbackUrl;
    let isCreditCard;
    beforeEach(() => {
      application = applicationFixture();
      postbackUrl = 'test.com';
      isCreditCard = 'true';

      jest
        .spyOn(yardiService, 'getCardPaymentForm')
        .mockResolvedValue('success' as any);
      jest.spyOn(integrationDataService, 'updateAwaitingPaymentInfo');
      jest
        .spyOn(guestcardUtils, 'validateGuestcardData')
        .mockResolvedValue(application);
    });

    it('calls functions with correct arguments', async () => {
      const res = await service.getCardPaymentFormService(
        application,
        postbackUrl,
        isCreditCard
      );

      expect(res).toEqual('success');
      expect(guestcardUtils.validateGuestcardData).toHaveBeenCalledWith(
        application
      );
      expect(yardiService.getCardPaymentForm).toHaveBeenCalledWith(
        application,
        postbackUrl,
        isCreditCard
      );
      expect(
        integrationDataService.updateAwaitingPaymentInfo
      ).toHaveBeenCalledWith(application, true);
    });
  });
});

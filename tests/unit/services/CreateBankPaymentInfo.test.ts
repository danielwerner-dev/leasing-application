import * as yardiService from '$lib/connectors/yardi-service';
import * as updateIntegrationData from '$lib/services/UpdateIntegrationData';
import * as guestcardUtil from '$lib/utils/guestcard';
import * as service from '$lib/services/CreateBankPaymentInfo';

import { applicationFixture } from '$fixtures';

jest.mock('$lib/connectors/yardi-service', () => {
  return {
    addBankAccount: jest.fn()
  };
});

jest.mock('$lib/services/UpdateIntegrationData', () => {
  return {
    createYardiPaymentInfo: jest.fn()
  };
});

jest.mock('$lib/utils/guestcard', () => {
  return {
    validateGuestcardData: jest.fn()
  };
});

describe('Create Bank Payment Info Service Service', () => {
  describe('when Yardi connector returns', () => {
    let application;
    let bankInfo;
    let mockBankAccoundResponse;
    beforeEach(() => {
      mockBankAccoundResponse = [
        {
          payerId: '1234',
          description: 'success'
        }
      ];
      application = applicationFixture();
      bankInfo = {
        accountNumber: '1234',
        routingNumber: '1234',
        nameOnAccount: 'Billy Idol',
        accountType: 'checking'
      };

      application.integrationData.yardi = {
        applicantId: '1234',
        guestcardId: '1234'
      };

      jest
        .spyOn(yardiService, 'addBankAccount')
        .mockResolvedValue(mockBankAccoundResponse);
      jest.spyOn(updateIntegrationData, 'createYardiPaymentInfo');
      jest
        .spyOn(guestcardUtil, 'validateGuestcardData')
        .mockResolvedValue(application);
    });

    it('calls the correct functions', async () => {
      const res = await service.createBankPaymentTypeService(
        application,
        bankInfo
      );

      expect(res).toEqual(mockBankAccoundResponse);
      expect(guestcardUtil.validateGuestcardData).toHaveBeenCalledWith(
        application
      );
      expect(yardiService.addBankAccount).toHaveBeenCalledWith(
        application,
        bankInfo.accountNumber,
        bankInfo.routingNumber,
        bankInfo.nameOnAccount,
        bankInfo.accountType
      );
      expect(updateIntegrationData.createYardiPaymentInfo).toHaveBeenCalledWith(
        application,
        {
          ...mockBankAccoundResponse[0],
          paymentType: 'ACH',
          nameOnAccount: 'Billy Idol',
          accountType: 'checking'
        }
      );
    });

    it('throws if addBankAccount response is invalid: null', async () => {
      jest.spyOn(yardiService, 'addBankAccount').mockResolvedValue(null as any);

      await expect(
        service.createBankPaymentTypeService(application, bankInfo)
      ).rejects.toThrowError(
        `Error when trying to add bank account to application: ${application.applicationId}`
      );
    });

    it('throws if addBankAccount response is invalid: empty array', async () => {
      jest.spyOn(yardiService, 'addBankAccount').mockResolvedValue([] as any);

      await expect(
        service.createBankPaymentTypeService(application, bankInfo)
      ).rejects.toThrowError(
        `Error when trying to add bank account to application: ${application.applicationId}`
      );
    });
  });
});

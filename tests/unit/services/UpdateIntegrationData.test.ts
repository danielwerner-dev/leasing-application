import { applicationFixture } from '$fixtures';
import * as updateApplication from '$lib/repositories/leasing-application/update-application';
import * as services from '$lib/services/UpdateIntegrationData';
import { ApplicationStatus, PaymentType } from '$lib/types/Application.types';

jest.mock('$lib/repositories/leasing-application/update-application', () => {
  return {
    updateIntegrationData: jest.fn()
  };
});

describe('UpdateIntegrationData', () => {
  let application;
  beforeEach(() => {
    application = applicationFixture();
  });

  describe('updateIntegrationData', () => {
    it('calls updateIntegrationData when applicaiton is not deleted', async () => {
      await services.updateIntegrationDataService(application, {});

      expect(updateApplication.updateIntegrationData).toHaveBeenCalledWith(
        application.applicationId,
        {}
      );
    });

    it('does not call updateIntegrationData for deleted application', async () => {
      application.applicationStatus = ApplicationStatus.deleted;

      await expect(
        services.updateIntegrationDataService(application, {})
      ).rejects.toThrow();
      expect(updateApplication.updateIntegrationData).not.toHaveBeenCalled();
    });
  });

  describe('createYardiPaymentInfo', () => {
    let paymentInfo;
    beforeEach(() => {
      jest.spyOn(services, 'updateIntegrationDataService').mockResolvedValue();
      paymentInfo = {
        payerId: '1234',
        description: '1234',
        paymentType: PaymentType.CREDIT
      };
    });

    describe('when integration data has guestcardId and applicantId', () => {
      it('calls updateIntegratioDataService', async () => {
        await services.createYardiPaymentInfo(application, paymentInfo);

        const expectedIntegrationData = {
          yardi: {
            ...application.integrationData.yardi,
            awaitingPaymentInfo: false,
            paymentInfo: paymentInfo
          }
        };

        expect(services.updateIntegrationDataService).toHaveBeenCalledWith(
          application,
          expectedIntegrationData
        );
      });
    });
  });

  describe('updateAwaitingPaymentInfo', () => {
    let application;
    let awaitingPaymentInfo;
    beforeEach(() => {
      application = applicationFixture();
      awaitingPaymentInfo = true;

      jest.spyOn(services, 'updateIntegrationDataService');
    });

    it('calls updateIntegrationDataService', async () => {
      await services.updateAwaitingPaymentInfo(
        application,
        awaitingPaymentInfo
      );

      const expectedIntegrationData = {
        yardi: {
          ...application.integrationData.yardi,
          awaitingPaymentInfo: awaitingPaymentInfo
        }
      };

      expect(services.updateIntegrationDataService).toHaveBeenCalledWith(
        application,
        expectedIntegrationData
      );
    });

    it("throws if there's no yardi info", async () => {
      application.integrationData.yardi = null;

      await expect(
        services.updateAwaitingPaymentInfo(application, awaitingPaymentInfo)
      ).rejects.toThrowError(
        `Impossible to set "awaitingPaymentInfo" for application ${application.applicationId}. Missing Yardi info.`
      );

      expect(services.updateIntegrationDataService).not.toHaveBeenCalled();
    });
  });
});

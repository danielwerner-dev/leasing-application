import * as service from '$lib/services/DeletePaymentType';
import * as yardiService from '$lib/connectors/yardi-service';
import * as integrationDataService from '$lib/services/UpdateIntegrationData';
import { applicationFixture } from '$fixtures';

jest.mock('$lib/connectors/yardi-service', () => {
  return {
    deletePaymentType: jest.fn()
  };
});

jest.mock('$lib/services/UpdateIntegrationData', () => {
  return {
    updateIntegrationDataService: jest.fn()
  };
});

describe('Delete Payment service tests', () => {
  describe('deletePaymentTypeService', () => {
    let application: any;
    let applicantId: any;
    let guestcardId: any;
    let paymentType: any;
    let payerId: any;
    let yardi: any;
    beforeEach(() => {
      applicantId = 'applicant-id';
      guestcardId = 'guestcard-id';
      paymentType = 'CREDIT';
      payerId = 'payer-id';
      yardi = {
        guestcardId,
        applicantId,
        paymentInfo: {
          payerId,
          paymentType
        }
      };
      application = applicationFixture();
      application.integrationData = { yardi };

      jest.spyOn(yardiService, 'deletePaymentType');
      jest.spyOn(integrationDataService, 'updateIntegrationDataService');
    });

    it('calls yardi connector and integration data service on success', async () => {
      await service.deletePaymentTypeService(application);
      expect(yardiService.deletePaymentType).toHaveBeenCalledWith(
        application.property.propertyCode,
        applicantId,
        guestcardId,
        payerId,
        paymentType
      );
      expect(
        integrationDataService.updateIntegrationDataService
      ).toHaveBeenCalledWith(application, {
        yardi: {
          guestcardId,
          applicantId,
          awaitingPaymentInfo: false
        }
      });
    });

    it('throws for invalid payment type', async () => {
      const invalidYardi = {
        ...yardi,
        paymentInfo: {
          payerId,
          paymentType: 'invalid-payment'
        }
      };
      application.integrationData = { yardi: invalidYardi };

      await expect(
        service.deletePaymentTypeService(application)
      ).rejects.toThrow();
      expect(yardiService.deletePaymentType).not.toHaveBeenCalled();
      expect(
        integrationDataService.updateIntegrationDataService
      ).not.toHaveBeenCalled();
    });
  });
});

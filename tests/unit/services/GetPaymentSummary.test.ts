import { applicationFixture } from '$fixtures';
import * as readApplication from '$lib/repositories/leasing-application/read-application';
import * as service from '$lib/services/GetPaymentSummary';

jest.mock('$lib/repositories/leasing-application/read-application', () => {
  return {
    listCoapplicantApplications: jest.fn()
  };
});

describe('Get payment summary service', () => {
  describe('parsePaymentSummary', () => {
    let applications;
    beforeEach(() => {
      applications = [
        applicationFixture(),
        applicationFixture(),
        applicationFixture()
      ];
    });

    it('returns parsed application array', () => {
      const parsed = service.parsePaymentSummary(applications);

      expect(parsed).toHaveLength(applications.length);
      expect(parsed[0]).toHaveProperty('isPaid');
      expect(parsed[0]).toHaveProperty('type');
      expect(parsed[0]).toHaveProperty('email');
      expect(parsed[0]).toHaveProperty('firstName');
      expect(parsed[0]).toHaveProperty('lastName');
    });

    it('uses primaryApplicationData when formData is not available', () => {
      applications[0].formData = {};
      applications[0].primaryApplicationData = {
        firstName: 'Test',
        lastName: 'Primary',
        applicationType: 'personally-corporated'
      };

      const parsed = service.parsePaymentSummary(applications);

      expect(parsed).toHaveLength(applications.length);
      expect(parsed[0].firstName).toEqual('Test');
      expect(parsed[0].lastName).toEqual('Primary');
      expect(parsed[0].type).toEqual('personally-corporated');
    });
  });

  describe('getPaymentSummaryService', () => {
    let application;
    beforeEach(() => {
      application = applicationFixture();

      jest.spyOn(service, 'parsePaymentSummary');
      jest
        .spyOn(readApplication, 'listCoapplicantApplications')
        .mockResolvedValue([application] as any);
    });

    it('calls listCoapplicantsApplications with own id if type is primary', async () => {
      application.applicationType = 'primary';

      await service.getPaymentSummaryService(application);

      expect(readApplication.listCoapplicantApplications).toHaveBeenCalledWith(
        application.applicationId,
        { includePrimary: true }
      );
      expect(service.parsePaymentSummary).toHaveBeenCalledWith([application]);
    });

    it('calls listCoapplicantsApplication with primaryApplicationId for type coapplicant', async () => {
      application.applicationType = 'coapplicant';
      application.primaryApplicationId = 'primaryId';

      await service.getPaymentSummaryService(application);

      expect(readApplication.listCoapplicantApplications).toHaveBeenCalledWith(
        'primaryId',
        { includePrimary: true }
      );
      expect(service.parsePaymentSummary).toHaveBeenCalledWith([application]);
    });
  });
});

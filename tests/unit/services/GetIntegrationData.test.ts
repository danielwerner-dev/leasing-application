import { applicationFixture } from '$fixtures';
import * as s3 from '$lib/connectors/s3';
import * as yardiService from '$lib/connectors/yardi-service';
import * as service from '$lib/services/GetIntegrationData';

jest.mock('$lib/connectors/s3', () => {
  return {
    listApplicationDocuments: jest.fn()
  };
});

jest.mock('$lib/connectors/yardi-service', () => {
  return {
    getPaymentTypes: jest.fn()
  };
});

jest.mock('$lib/services/UpdateIntegrationData', () => {
  return {
    createYardiPaymentInfo: jest.fn()
  };
});

describe('Get Integration Data service', () => {
  describe('getFiles', () => {
    let applicationId;
    beforeEach(() => {
      applicationId = 'test';

      jest.spyOn(s3, 'listApplicationDocuments');
    });

    it('calls listApplicationDocuments', async () => {
      await service.getFiles(applicationId);

      expect(s3.listApplicationDocuments).toHaveBeenCalledWith(applicationId);
    });
  });

  describe('getYardiInfo', () => {
    let application;
    beforeEach(() => {
      application = applicationFixture();

      jest.spyOn(yardiService, 'getPaymentTypes');
    });

    it('returns same yardi info when awaitingPaymentInfo is false', async () => {
      application.integrationData.yardi = {
        awaitingPaymentInfo: false
      };

      const res = await service.getYardiInfo(application);

      expect(res).toEqual(application.integrationData.yardi);
      expect(yardiService.getPaymentTypes).not.toHaveBeenCalled();
    });

    it('returns same yardi info for invalid paymentTypes: null', async () => {
      application.integrationData.yardi = {
        awaitingPaymentInfo: true
      };
      jest
        .spyOn(yardiService, 'getPaymentTypes')
        .mockResolvedValue(null as any);

      const res = await service.getYardiInfo(application);

      expect(res).toEqual(application.integrationData.yardi);
      expect(yardiService.getPaymentTypes).toHaveBeenCalledWith(application);
    });

    it('returns same yardi info for invalid paymentTypes: empty array', async () => {
      application.integrationData.yardi = {
        awaitingPaymentInfo: true
      };
      jest.spyOn(yardiService, 'getPaymentTypes').mockResolvedValue([] as any);

      const res = await service.getYardiInfo(application);

      expect(res).toEqual(application.integrationData.yardi);
      expect(yardiService.getPaymentTypes).toHaveBeenCalledWith(application);
    });

    it('returns updated yardi info when paymentType returns value', async () => {
      application.integrationData.yardi = {
        awaitingPaymentInfo: true
      };
      jest
        .spyOn(yardiService, 'getPaymentTypes')
        .mockResolvedValue(['hello world'] as any);

      const expectedYardiInfo = {
        ...application.integrationData.yardi,
        awaitingPaymentInfo: false,
        paymentInfo: 'hello world'
      };

      const res = await service.getYardiInfo(application);

      expect(res).toEqual(expectedYardiInfo);
      expect(yardiService.getPaymentTypes).toHaveBeenCalledWith(application);
    });
  });

  describe('getIntegrationData', () => {
    let application;
    beforeEach(() => {
      application = applicationFixture();

      jest.spyOn(service, 'getFiles').mockResolvedValue('files' as any);
      jest.spyOn(service, 'getYardiInfo').mockResolvedValue('yardi' as any);
    });

    it('calls getFiles and getYardi', async () => {
      const res = await service.getIntegrationData(application);

      expect(res).toEqual({ files: 'files', yardi: 'yardi' });
      expect(service.getFiles).toHaveBeenCalledWith(application.applicationId);
      expect(service.getYardiInfo).toHaveBeenCalledWith(application);
    });
  });
});

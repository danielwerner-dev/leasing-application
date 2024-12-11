import * as service from '$lib/services/GetApplication';
import * as PLSConnector from '$lib/connectors/pls';
import * as ReadRepo from '$lib/repositories/leasing-application/read-application';
import * as UpdateRepo from '$lib/repositories/leasing-application/update-application';
import * as ApplicationStatusService from '$lib/services/GetApplicationStatus';
import * as GetIntegrationData from '$lib/services/GetIntegrationData';
import { AxiosError } from 'axios';

jest.mock('$lib/connectors/pls', () => {
  return {
    getPropertyBySlug: jest.fn()
  };
});

jest.mock('$lib/repositories/leasing-application/read-application', () => {
  return {
    listApplicationByCustomer: jest.fn()
  };
});

jest.mock('$lib/repositories/leasing-application/update-application', () => {
  return {
    updateApplicationExternalFields: jest.fn(),
    updateApplicationProperty: jest.fn()
  };
});

jest.mock('$lib/services/GetApplicationStatus', () => {
  return {
    getApplicationStatus: jest.fn()
  };
});

jest.mock('$lib/services/GetIntegrationData', () => {
  return {
    getFiles: jest.fn(),
    getYardiInfo: jest.fn()
  };
});

jest.mock('$lib/utils/errors', () => {
  return {
    logError: jest.fn()
  };
});

jest.mock('$lib/utils/application-permissions', () => {
  return {
    getApplicationPermissions: jest.fn()
  };
});

describe('GetApplication service', () => {
  describe('getUpdatedProperty', () => {
    let applicationId: any;
    let property: any;
    beforeEach(() => {
      applicationId = 'application-id';
      property = {
        slug: 'slug'
      };

      jest
        .spyOn(PLSConnector, 'getPropertyBySlug')
        .mockResolvedValue('property-test' as any);
    });

    it('returns property from PLS connector on success', async () => {
      const res = await service.getUpdatedProperty(applicationId, property);

      expect(res).toEqual('property-test');
      expect(PLSConnector.getPropertyBySlug).toHaveBeenCalledWith('slug');
    });

    it('returns current property from application on failure', async () => {
      jest
        .spyOn(PLSConnector, 'getPropertyBySlug')
        .mockRejectedValue(new Error('property-error'));

      const res = await service.getUpdatedProperty(applicationId, property);

      expect(res).toEqual(property);
    });

    it('calls axiosLogger if error is AxiosError', async () => {
      jest
        .spyOn(PLSConnector, 'getPropertyBySlug')
        .mockRejectedValue(new AxiosError());

      const res = await service.getUpdatedProperty(applicationId, property);

      expect(res).toEqual(property);
    });
  });

  describe('getUpdatedApplication', () => {
    let application: any;
    beforeEach(() => {
      application = {
        applicationId: 'application-id',
        property: {
          slug: 'slug'
        }
      };

      jest
        .spyOn(service, 'getUpdatedProperty')
        .mockResolvedValue('property-test' as any);
      jest
        .spyOn(GetIntegrationData, 'getFiles')
        .mockResolvedValue('files' as any);
      jest
        .spyOn(GetIntegrationData, 'getYardiInfo')
        .mockResolvedValue('yardi' as any);
      jest
        .spyOn(ApplicationStatusService, 'getApplicationStatus')
        .mockResolvedValue('status-test' as any);
      jest.spyOn(UpdateRepo, 'updateApplicationExternalFields');
    });

    it('returns updated application', async () => {
      const res = await service.getUpdatedApplication(application);

      expect(res).toEqual({
        applicationId: 'application-id',
        applicationStatus: 'status-test',
        property: 'property-test',
        integrationData: {
          yardi: 'yardi',
          files: 'files'
        }
      });
    });
  });

  describe('getApplicationsByCustomerId', () => {
    let customerId: any;
    beforeEach(() => {
      customerId = 'customer-id';

      jest
        .spyOn(ReadRepo, 'listApplicationByCustomer')
        .mockResolvedValue([
          { applicationId: 'application-id', property: { slug: 'slug' } } as any
        ]);
      jest
        .spyOn(PLSConnector, 'getPropertyBySlug')
        .mockResolvedValue('property-test' as any);
      jest
        .spyOn(ApplicationStatusService, 'getApplicationStatus')
        .mockResolvedValue('status-test' as any);
      jest.spyOn(UpdateRepo, 'updateApplicationProperty');
    });

    it('returns array of updated applications with property and status', async () => {
      const res = await service.getApplicationsByCustomerId(customerId);

      expect(res).toEqual([
        {
          applicationId: 'application-id',
          property: 'property-test',
          applicationStatus: 'status-test'
        }
      ]);
      expect(UpdateRepo.updateApplicationProperty).toHaveBeenCalledWith(
        'application-id',
        'property-test'
      );
    });
  });
});

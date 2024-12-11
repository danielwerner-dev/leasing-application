import { applicationFixture } from '$fixtures';
import * as readApplication from '$lib/repositories/leasing-application/read-application';
import * as service from '$lib/services/ListLinkedApplications';

jest.mock('$lib/repositories/leasing-application/read-application', () => {
  return {
    listCoapplicantApplications: jest.fn()
  };
});

describe('List linked applications service', () => {
  describe('removeSensitiveData', () => {
    let application;
    beforeEach(() => {
      application = applicationFixture();
    });

    it('removes sensitive data from application', () => {
      const res = service.removeSensitiveData(application);

      expect(res).not.toEqual(application);
      expect(res).not.toHaveProperty('formData');
      expect(res.integrationData).not.toHaveProperty('files');
    });
  });

  describe('listLinkedApplications', () => {
    let application;
    beforeEach(() => {
      application = applicationFixture();

      jest
        .spyOn(readApplication, 'listCoapplicantApplications')
        .mockResolvedValue(['hello world'] as any);
      jest.spyOn(service, 'removeSensitiveData').mockImplementation(jest.fn());
    });

    it('calls listCoapplicantApplications and removeSensitiveData', async () => {
      application.applicationType = 'primary';
      await service.listLinkedApplications(application);

      expect(service.removeSensitiveData).toHaveBeenCalledWith(
        'hello world',
        0,
        ['hello world']
      );
      expect(readApplication.listCoapplicantApplications).toHaveBeenCalledWith(
        application.applicationId
      );
    });

    it('throws if application it not type primary', async () => {
      application.applicationType = 'coapplicant';

      await expect(
        service.listLinkedApplications(application)
      ).rejects.toThrowError('Application is not primary');

      expect(
        readApplication.listCoapplicantApplications
      ).not.toHaveBeenCalled();
      expect(service.removeSensitiveData).not.toHaveBeenCalled();
    });
  });
});

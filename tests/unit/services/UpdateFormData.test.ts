import * as updateApplication from '$lib/repositories/leasing-application/update-application';
import * as getIntegrationData from '$lib/services/GetIntegrationData';
import * as validator from '$lib/form-validation/validator';
import * as formValidation from '$lib/utils/form-validation';
import * as service from '$lib/services/UpdateFormData';
import { applicationFixture } from '$fixtures';

jest.mock('$lib/repositories/leasing-application/update-application', () => {
  return {
    updateFormData: jest.fn()
  };
});

jest.mock('$lib/services/GetIntegrationData', () => {
  return {
    getIntegrationData: jest.fn()
  };
});

jest.mock('$lib/form-validation/validator', () => {
  return {
    validateFormData: jest.fn()
  };
});

jest.mock('$lib/utils/form-validation', () => {
  return {
    getValidationContext: jest.fn()
  };
});

describe('Update form data service', () => {
  describe('updateFormDataService', () => {
    let application;
    let formData;
    let ipAddress;
    beforeEach(() => {
      application = applicationFixture();
      formData = { general: 'hello world' };
      ipAddress = '127.0.0.1';
      jest
        .spyOn(getIntegrationData, 'getIntegrationData')
        .mockResolvedValue(application.integrationData);
      jest
        .spyOn(updateApplication, 'updateFormData')
        .mockResolvedValue(application);
      jest.spyOn(validator, 'validateFormData').mockReturnValue(true);
      jest
        .spyOn(formValidation, 'getValidationContext')
        .mockReturnValue('context' as any);
    });

    it('returns updated application', async () => {
      const res = await service.updateFormDataService(
        application,
        formData,
        ipAddress
      );

      expect(res).toEqual(application);
      expect(getIntegrationData.getIntegrationData).toHaveBeenCalledWith(
        application
      );
      expect(updateApplication.updateFormData).toHaveBeenCalledWith(
        application.applicationId,
        formData,
        ipAddress
      );
      expect(formValidation.getValidationContext).toHaveBeenCalledWith(
        application
      );
      expect(validator.validateFormData).toHaveBeenCalledWith(
        formData,
        'context'
      );
    });

    it('throws when validateFormData is false', async () => {
      jest.spyOn(validator, 'validateFormData').mockReturnValue(false);

      await expect(
        service.updateFormDataService(application, formData, ipAddress)
      ).rejects.toThrowError('Invalid form data.');

      expect(getIntegrationData.getIntegrationData).not.toHaveBeenCalled();
      expect(updateApplication.updateFormData).not.toHaveBeenCalled();
      expect(formValidation.getValidationContext).toHaveBeenCalledWith(
        application
      );
      expect(validator.validateFormData).toHaveBeenCalledWith(
        formData,
        'context'
      );
    });
  });
});

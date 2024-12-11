import * as readApplication from '$lib/repositories/leasing-application/read-application';
import * as emailService from '$lib/connectors/email-service';
import * as service from '$lib/services/EmailCoapplicantInvite';
import { applicationFixture } from '$fixtures';
import { EmailTemplates } from '$lib/types/email-delivery-service.types';
import { Application } from '$lib/types/Application.types';
import type { PrimaryApplicationData } from '$lib/types/Application.types';
import { ValidationError } from 'yup';

process.env.LEASING_APPLICATION_BASE_URL =
  'https://www.invitationhomes.com/lease';

jest.mock('$lib/repositories/leasing-application/read-application', () => {
  return {
    getApplication: jest.fn()
  };
});

jest.mock('$lib/connectors/email-service', () => {
  return {
    sendEmail: jest.fn()
  };
});

describe('EmailCoapplicantInvite service', () => {
  describe('emailCoapplicantInvite', () => {
    let primaryApplication;
    let coapplicantApplication;
    beforeEach(() => {
      primaryApplication = applicationFixture();
      coapplicantApplication = applicationFixture();
      coapplicantApplication.applicationId = '789';
      coapplicantApplication.customer.email = 'coapplicant@email.com';
      coapplicantApplication.primaryApplicationId =
        primaryApplication.applicationId;

      jest
        .spyOn(emailService, 'sendEmail')
        .mockResolvedValue({ messageId: '123' });
    });

    it('sends an e-mail for an authorized existing application with correct parameters', async () => {
      await service.emailCoapplicantInvite(
        primaryApplication,
        coapplicantApplication
      );

      expect(emailService.sendEmail).toHaveBeenCalledWith(
        EmailTemplates.COAPPLICANT_INVITATION,
        'coapplicant@email.com',
        expect.anything()
      );
    });

    it('throws if coapplicant application is not provided', async () => {
      jest.spyOn(readApplication, 'getApplication').mockResolvedValue(null);

      await expect(
        service.emailCoapplicantInvite(
          primaryApplication,
          undefined as unknown as Application
        )
      ).rejects.toThrowError('Application required to send coapplicant invite');
    });
  });

  describe('getTemplateParameters', () => {
    let primaryApplication: any;
    it('returns the correct template parameters', () => {
      primaryApplication = applicationFixture();
      primaryApplication.formData.general.firstName = 'John';
      primaryApplication.formData.general.lastName = 'Snow';

      const coapplicantApplication = applicationFixture();
      coapplicantApplication.applicationId = '789';
      coapplicantApplication.primaryApplicationData = {
        firstName: 'Theon',
        lastName: 'Greyjoy'
      } as unknown as PrimaryApplicationData;

      const res = service.getTemplateParameters(
        primaryApplication,
        coapplicantApplication
      );

      expect(res).toEqual(
        expect.arrayContaining([
          { key: 'primary_applicant_name', value: 'John Snow' },
          { key: 'co_applicant_name', value: 'Theon Greyjoy' },
          { key: 'property_address', value: '123 Garden Avenue' },
          {
            key: 'application_url',
            value: 'https://www.invitationhomes.com/lease/applications/789'
          }
        ])
      );
    });

    it('Handles missing coapplicant names', async () => {
      const primaryApplication = applicationFixture();
      const coapplicantApplication = applicationFixture();
      coapplicantApplication.primaryApplicationData =
        {} as unknown as PrimaryApplicationData;

      expect(() => {
        service.getTemplateParameters(
          primaryApplication,
          coapplicantApplication
        );
      }).toThrowError(ValidationError);
    });
  });
});

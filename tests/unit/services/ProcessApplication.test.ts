import * as submission from '$lib/services/Submission';
import * as validator from '$lib/form-validation/validator';
import * as formValidation from '$lib/utils/form-validation';
import * as paymentAmount from '$lib/utils/payment-amount';
import * as readApplication from '$lib/repositories/leasing-application/read-application';
import * as updateApplication from '$lib/repositories/leasing-application/update-application';

import * as service from '$lib/services/ProcessApplication';
import { applicationFixture } from '$fixtures';
import {
  applicationSubmissionResponseFixture,
  yardiCoapplicantFixture
} from '$fixtures/yardi-service/submission';

jest.mock('$lib/services/Submission', () => {
  return {
    submit: jest.fn()
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

jest.mock('$lib/utils/payment-amount', () => {
  return {
    validatePaymentAmount: jest.fn()
  };
});

jest.mock('$lib/repositories/leasing-application/read-application', () => {
  return {
    listCoapplicantApplications: jest.fn()
  };
});

jest.mock('$lib/repositories/leasing-application/update-application', () => {
  return {
    updatePaidByIdTransaction: jest.fn()
  };
});

describe('Process application service', () => {
  describe('processApplicationService', () => {
    let application;
    let applicationPaidFor;
    let applicationNotPaidFor;
    let applicantsToPay;
    let amountToPay;
    let ipAddress;
    let authorization;
    let submissionResponse;
    let coapplicants;
    beforeEach(() => {
      authorization = 'Bearer 273498279384';
      amountToPay = 50;
      ipAddress = '127.0.0.1';

      application = applicationFixture();
      application.applicationType = 'primary';

      applicantsToPay = [application.customer.email];
      applicationPaidFor = applicationFixture();
      applicationPaidFor.applicationType = 'coapplicant';

      applicationNotPaidFor = applicationFixture();
      applicationNotPaidFor.applicationType = 'coapplicant';

      applicantsToPay = [
        application.customer.email,
        applicationPaidFor.customer.email
      ];

      const coapplicant1 = yardiCoapplicantFixture();
      coapplicant1.email = applicationPaidFor.customer.email;
      const coapplicant2 = yardiCoapplicantFixture();
      coapplicant2.email = applicationNotPaidFor.customer.email;
      coapplicants = [coapplicant1, coapplicant2];

      submissionResponse = applicationSubmissionResponseFixture();
      submissionResponse.coapplicants = coapplicants;

      jest.spyOn(submission, 'submit');
      jest.spyOn(validator, 'validateFormData').mockReturnValue(true);
      jest
        .spyOn(formValidation, 'getValidationContext')
        .mockReturnValue('context' as any);
      jest.spyOn(paymentAmount, 'validatePaymentAmount');
      jest
        .spyOn(readApplication, 'listCoapplicantApplications')
        .mockResolvedValue([
          application,
          applicationNotPaidFor,
          applicationPaidFor
        ]);
    });

    it('calls finalize application on success', async () => {
      application.applicationStatus = 'draft';
      const {
        property: { market }
      } = application;
      await service.processApplicationService(
        application,
        applicantsToPay,
        amountToPay,
        ipAddress,
        authorization
      );

      expect(formValidation.getValidationContext).toHaveBeenCalledWith(
        application
      );
      expect(validator.validateFormData).toHaveBeenCalledWith(
        application.formData,
        'context'
      );
      expect(paymentAmount.validatePaymentAmount).toHaveBeenCalledWith(
        market.slug,
        applicantsToPay,
        amountToPay,
        application
      );
      expect(submission.submit).toHaveBeenCalledWith(application, {
        applicantsToPay,
        amountToPay,
        ipAddress,
        authorization
      });
    });

    it('calls complete application on success when applicant is only paying for themselves', async () => {
      application.applicationStatus = 'draft';
      const {
        property: { market }
      } = application;
      await service.processApplicationService(
        application,
        applicantsToPay,
        amountToPay,
        ipAddress,
        authorization
      );

      expect(formValidation.getValidationContext).toHaveBeenCalledWith(
        application
      );
      expect(validator.validateFormData).toHaveBeenCalledWith(
        application.formData,
        'context'
      );
      expect(paymentAmount.validatePaymentAmount).toHaveBeenCalledWith(
        market.slug,
        applicantsToPay,
        amountToPay,
        application
      );
      expect(submission.submit).toHaveBeenCalledWith(application, {
        applicantsToPay,
        amountToPay,
        ipAddress,
        authorization
      });
    });

    it('calls complete application on success when applicant is paying themselves + coapplicant', async () => {
      application.applicationStatus = 'draft';
      applicantsToPay.push('dolly@dollyparton.com');
      amountToPay = 100;
      const {
        property: { market }
      } = application;
      await service.processApplicationService(
        application,
        applicantsToPay,
        amountToPay,
        ipAddress,
        authorization
      );

      expect(formValidation.getValidationContext).toHaveBeenCalledWith(
        application
      );
      expect(validator.validateFormData).toHaveBeenCalledWith(
        application.formData,
        'context'
      );
      expect(paymentAmount.validatePaymentAmount).toHaveBeenCalledWith(
        market.slug,
        applicantsToPay,
        amountToPay,
        application
      );
      expect(submission.submit).toHaveBeenCalledWith(application, {
        applicantsToPay,
        amountToPay,
        ipAddress,
        authorization
      });
    });

    it('calls complete application on success when applicant is paid for and not paying for anyone else', async () => {
      application.applicationStatus = 'draft';
      application.paidById = '1234';
      amountToPay = 0;
      applicantsToPay = [];

      const {
        property: { market }
      } = application;
      await service.processApplicationService(
        application,
        applicantsToPay,
        amountToPay,
        ipAddress,
        authorization
      );

      expect(formValidation.getValidationContext).toHaveBeenCalledWith(
        application
      );
      expect(validator.validateFormData).toHaveBeenCalledWith(
        application.formData,
        'context'
      );
      expect(paymentAmount.validatePaymentAmount).toHaveBeenCalledWith(
        market.slug,
        applicantsToPay,
        amountToPay,
        application
      );
      expect(submission.submit).toHaveBeenCalledWith(application, {
        applicantsToPay,
        amountToPay,
        ipAddress,
        authorization
      });
    });

    it('calls complete application on success when applicant is paid for and paying for coapplicant', async () => {
      application.applicationStatus = 'draft';
      application.paidById = '1234';
      amountToPay = 50;
      applicantsToPay = ['coapplicant@email.com'];

      const {
        property: { market }
      } = application;

      await service.processApplicationService(
        application,
        applicantsToPay,
        amountToPay,
        ipAddress,
        authorization
      );

      expect(formValidation.getValidationContext).toHaveBeenCalledWith(
        application
      );
      expect(validator.validateFormData).toHaveBeenCalledWith(
        application.formData,
        'context'
      );
      expect(paymentAmount.validatePaymentAmount).toHaveBeenCalledWith(
        market.slug,
        applicantsToPay,
        amountToPay,
        application
      );
      expect(submission.submit).toHaveBeenCalledWith(application, {
        applicantsToPay,
        amountToPay,
        ipAddress,
        authorization
      });
    });

    it('throws an error when applicant is paid for, paying for coapplicant, and does not have a paymentType', async () => {
      application.integrationData.yardi = {
        guestcardId: 'p151515',
        applicantId: 'p151515'
      };
      applicantsToPay = ['somecoapplicant@gmail.com'];
      application.paidById = '1234';
      await expect(
        service.processApplicationService(
          application,
          applicantsToPay,
          amountToPay,
          ipAddress,
          authorization
        )
      ).rejects.toThrowError(
        `Payment data is not valid to process. Application id: ${application.applicationId}`
      );
    });

    it('throws an error when applicant is NOT paid for and does NOT have a paymentType', async () => {
      application.integrationData.yardi = {
        guestcardId: 'p151515',
        applicantId: 'p151515'
      };
      application.paidById = '';

      await expect(
        service.processApplicationService(
          application,
          applicantsToPay,
          amountToPay,
          ipAddress,
          authorization
        )
      ).rejects.toThrowError(
        `Payment data is not valid to process. Application id: ${application.applicationId}`
      );
    });

    it('throws when applicant is NOT paid for and applicantsToPay does not contain applicant email', async () => {
      application.paidById = '';
      applicantsToPay = ['me@gmail.com'];
      await expect(
        service.processApplicationService(
          application,
          applicantsToPay,
          amountToPay,
          ipAddress,
          authorization
        )
      ).rejects.toThrowError(
        `Payment data is not valid to process. Applicant must pay for themselves. Application id: ${application.applicationId}`
      );
    });

    it('throws when applicant is NOT paid for and applicantsToPay is empty', async () => {
      application.paidById = '';
      applicantsToPay = [];
      await expect(
        service.processApplicationService(
          application,
          applicantsToPay,
          amountToPay,
          ipAddress,
          authorization
        )
      ).rejects.toThrowError(
        `Payment data is not valid to process. Applicant must pay for themselves. Application id: ${application.applicationId}`
      );
    });

    it('throws for applicationStatus other than `draft`', async () => {
      application.applicationStatus = 'created';
      await expect(
        service.processApplicationService(
          application,
          applicantsToPay,
          amountToPay,
          ipAddress,
          authorization
        )
      ).rejects.toThrowError(
        `Invalid status to process application. Status: ${application.applicationStatus} Application id: ${application.applicationId}`
      );

      expect(formValidation.getValidationContext).not.toHaveBeenCalled();
      expect(validator.validateFormData).not.toHaveBeenCalled();
      expect(paymentAmount.validatePaymentAmount).not.toHaveBeenCalled();
      expect(submission.submit).not.toHaveBeenCalled();
    });

    it('throws for invalid application.formData', async () => {
      jest.spyOn(validator, 'validateFormData').mockReturnValue(false);
      application.applicationStatus = 'draft';
      await expect(
        service.processApplicationService(
          application,
          applicantsToPay,
          amountToPay,
          ipAddress,
          authorization
        )
      ).rejects.toThrowError(
        `Form data is not valid to process. Application id: ${application.applicationId}`
      );

      expect(formValidation.getValidationContext).toHaveBeenCalledWith(
        application
      );
      expect(validator.validateFormData).toHaveBeenCalledWith(
        application.formData,
        'context'
      );
      expect(paymentAmount.validatePaymentAmount).not.toHaveBeenCalled();
      expect(submission.submit).not.toHaveBeenCalled();
    });

    it('throws when paidById transaction throws errors', async () => {
      jest
        .spyOn(updateApplication, 'updatePaidByIdTransaction')
        .mockRejectedValue(
          new Error('One or more applications could not be paid for')
        );

      await expect(
        service.processApplicationService(
          application,
          applicantsToPay,
          amountToPay,
          ipAddress,
          authorization
        )
      ).rejects.toThrowError('One or more applications could not be paid for');
    });

    it('rolls back paidById if there are errors', async () => {
      jest.spyOn(submission, 'submit').mockRejectedValue(new Error());

      await expect(
        service.processApplicationService(
          application,
          applicantsToPay,
          amountToPay,
          ipAddress,
          authorization
        )
      ).rejects.toThrow();

      expect(updateApplication.updatePaidByIdTransaction).toHaveBeenCalledTimes(
        2
      );
    });
  });
});

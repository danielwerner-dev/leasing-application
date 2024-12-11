import * as service from '$lib/services/Submission';
import * as repo from '$lib/repositories/leasing-application/update-application';
import * as repoGet from '$lib/repositories/leasing-application/read-application';
import * as createCoapplicant from '$lib/services/CreateCoapplicant';
import * as submitToYardi from '$lib/services/SubmitToYardi';
import { applicationFixture } from '$fixtures';
import { ApplicationType } from '$lib/types/Application.types';
import { yardiCoapplicantFixture } from '$fixtures/yardi-service/submission';

jest.mock('$lib/services/SubmitToYardi', () => {
  return {
    submitToYardiService: jest.fn()
  };
});

jest.mock('$lib/services/CreateCoapplicant', () => {
  return {
    createCoapplicantApplications: jest.fn()
  };
});

jest.mock('$lib/repositories/leasing-application/update-application', () => {
  return {
    updateCompletedApplication: jest.fn(),
    updateApplicationStartSubmission: jest.fn(),
    updateApplicationSubmissionStatus: jest.fn()
  };
});

jest.mock('$lib/repositories/leasing-application/read-application', () => {
  return { getApplication: jest.fn() };
});

describe('Submission service', () => {
  describe('finalizeSubmission', () => {
    let application: any;
    let applicantsToPay: any;
    const amountPaid = 0;
    const paymentMethod = 'CREDIT';
    const ipAddress = '127.0.0.1';
    let coapplicants;
    beforeEach(() => {
      application = applicationFixture();
      const coapplicant1 = yardiCoapplicantFixture();
      coapplicant1.email = 'john@snow.com';
      const coapplicant2 = yardiCoapplicantFixture();
      coapplicant2.email = 'tyrion@lannister.com';
      coapplicants = [coapplicant1, coapplicant2];
      applicantsToPay = [coapplicants[0].email];

      jest.spyOn(repo, 'updateCompletedApplication');
      jest.spyOn(repoGet, 'getApplication').mockResolvedValue(application);
      jest
        .spyOn(createCoapplicant, 'createCoapplicantApplications')
        .mockReturnValue([] as any);
    });

    it('calls updateCompletedApplication', async () => {
      application.paidById = '';
      application.formData.coapplicants.coapplicants = [];

      await service.finalizeSubmission(
        application,
        applicantsToPay,
        amountPaid,
        ipAddress,
        coapplicants
      );

      expect(repo.updateCompletedApplication).toHaveBeenCalledWith(
        application.applicationId,
        {
          amountPaid,
          paymentMethod
        }
      );
    });
    it('creates coapplicant applications when application type is primary', async () => {
      application.paidById = '';
      application.formData.coapplicants.coapplicants = [{}];
      application.applicationType = ApplicationType.primary;

      await service.finalizeSubmission(
        application,
        applicantsToPay,
        amountPaid,
        ipAddress,
        coapplicants
      );

      expect(
        createCoapplicant.createCoapplicantApplications
      ).toHaveBeenCalled();
    });

    it('does not attempt to create coapplicant applications when application type is coapplicant', async () => {
      application.paidById = '';
      application.formData.coapplicants.coapplicants = [];
      application.applicationType = ApplicationType.coapplicant;

      await service.finalizeSubmission(
        application,
        applicantsToPay,
        amountPaid,
        ipAddress,
        coapplicants
      );

      expect(
        createCoapplicant.createCoapplicantApplications
      ).not.toHaveBeenCalled();
    });
    it('succeeds if paymentMethod is not defined', () => {
      application.integrationData.yardi.paymentInfo.paymentType = undefined;
      application.paidById = '';
      application.formData.coapplicants.coapplicants = [];

      expect(
        service.finalizeSubmission(
          application,
          applicantsToPay,
          amountPaid,
          ipAddress,
          coapplicants
        )
      ).resolves.not.toThrow();
    });
  });

  describe('submit', () => {
    let application: any;
    let amountToPay: any;
    let authorization: any;
    let applicantsToPay: any;
    let ipAddress: any;
    let submission: any;
    beforeEach(() => {
      application = 'test-application';
      amountToPay = 50;
      authorization = 'test-authorization';
      applicantsToPay = ['test-applicants'];
      ipAddress = '127.0.0.1';
      submission = { coapplicants: ['applicant-1', 'applicant-2'] };

      jest.spyOn(service, 'finalizeSubmission').mockImplementation(jest.fn());
      jest
        .spyOn(submitToYardi, 'submitToYardiService')
        .mockResolvedValue(submission);
      jest.spyOn(repo, 'updateApplicationStartSubmission');
      jest.spyOn(repo, 'updateApplicationSubmissionStatus');
    });

    it('resolves on success', async () => {
      await service.submit(application, {
        amountToPay,
        authorization,
        applicantsToPay,
        ipAddress
      });

      expect(repo.updateApplicationStartSubmission).toHaveBeenCalledWith(
        application,
        ipAddress
      );
      expect(submitToYardi.submitToYardiService).toHaveBeenCalledWith(
        application,
        amountToPay,
        authorization,
        ipAddress
      );
      expect(service.finalizeSubmission).toHaveBeenCalledWith(
        application,
        applicantsToPay,
        amountToPay,
        ipAddress,
        submission.coapplicants
      );
      expect(repo.updateApplicationSubmissionStatus).not.toHaveBeenCalled();
    });

    it('udpate the status on error and throw', async () => {
      jest
        .spyOn(submitToYardi, 'submitToYardiService')
        .mockRejectedValue(new Error('error'));

      await expect(
        service.submit(application, {
          amountToPay,
          authorization,
          applicantsToPay,
          ipAddress
        })
      ).rejects.toThrowError('error');

      expect(repo.updateApplicationStartSubmission).toHaveBeenCalled();
      expect(service.finalizeSubmission).not.toHaveBeenCalled();
      expect(repo.updateApplicationSubmissionStatus).toHaveBeenCalledWith(
        application,
        'fail'
      );
    });
  });
});

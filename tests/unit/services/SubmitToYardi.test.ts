import { applicationFixture } from '$fixtures';
import {
  applicationSubmissionResponseFixture,
  coapplicantFixture
} from '$fixtures/yardi-service/submission';
import * as yardiService from '$lib/connectors/yardi-service';
import * as yardiParser from '$lib/parsers/yardi/yardi-submit.parser';
import * as service from '$lib/services/SubmitToYardi';
import * as documentService from '$lib/services/YardiDocumentService';

jest.mock('$lib/connectors/yardi-service', () => {
  return {
    submitApplication: jest.fn(),
    createApplicant: jest.fn(),
    deleteApplicant: jest.fn()
  };
});

jest.mock('$lib/parsers/yardi/yardi-submit.parser', () => {
  return {
    parseYardiPayload: jest.fn()
  };
});

jest.mock('$lib/services/YardiDocumentService', () => {
  return {
    getSubmissionDocuments: jest.fn(),
    deleteApplicationSummariesFromS3: jest.fn()
  };
});

describe('Submit to Yardi service', () => {
  describe('submitToYardiService', () => {
    let application;
    let amountPaid;
    let authorization;
    let ipAddress: any;
    beforeEach(() => {
      application = applicationFixture();
      amountPaid = 50;
      authorization = 'Bearer some-token';
      ipAddress = '127.0.0.1';

      jest
        .spyOn(documentService, 'getSubmissionDocuments')
        .mockResolvedValue([]);
      jest
        .spyOn(yardiParser, 'parseYardiPayload')
        .mockReturnValue('parsed payload' as any);
      jest.spyOn(yardiService, 'submitApplication');
    });

    it('builds a payload and submits to yardi ', async () => {
      application.applicationType = 'primary';
      application.integrationData.yardi = {
        guestcardId: 'guestcardId',
        applicantId: 'applicantId'
      };
      await service.submitToYardiService(
        application,
        amountPaid,
        authorization,
        ipAddress
      );

      expect(documentService.getSubmissionDocuments).toHaveBeenCalledWith(
        application,
        authorization
      );
      expect(yardiParser.parseYardiPayload).toHaveBeenCalledWith(
        application,
        amountPaid,
        ipAddress,
        []
      );
      expect(yardiService.submitApplication).toHaveBeenCalledWith(
        'guestcardId',
        'applicantId',
        'parsed payload'
      );
    });

    it('fails when application is missing a guestcardId ', async () => {
      application.integrationData.yardi.guestcardId = undefined;

      await expect(
        service.submitToYardiService(
          application,
          amountPaid,
          authorization,
          ipAddress
        )
      ).rejects.toThrowError('No guestcard id found for application');
    });

    it("throws if there's no Yardi info", async () => {
      application.integrationData.yardi = null;

      await expect(
        service.submitToYardiService(
          application,
          amountPaid,
          authorization,
          ipAddress
        )
      ).rejects.toThrowError(
        `Application does not have Yardi information. Application ${application.applicationId}`
      );

      expect(yardiParser.parseYardiPayload).toHaveBeenCalledWith(
        application,
        amountPaid,
        ipAddress,
        []
      );
      expect(yardiService.submitApplication).not.toHaveBeenCalled();
    });

    it('creates coapplicants prior to submission', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2023-02-02T18:59:15.326Z'));
      const coapplicant = coapplicantFixture();
      application.formData.coapplicants.coapplicants = [coapplicant];
      application.integrationData.yardi.guestcardId = 'guestcard123';
      application.integrationData.yardi.applicantId = 'applicant456';

      jest
        .spyOn(yardiService, 'submitApplication')
        .mockResolvedValue(applicationSubmissionResponseFixture());
      jest.spyOn(yardiService, 'createApplicant').mockResolvedValue({
        applicants: [{ ...coapplicant, applicantId: 'applicant456' }]
      });

      const expectedRequest = {
        audit: { submittedAt: '2023-02-02T18:59:15.326Z' },
        contactDetails: {
          email: coapplicant.email,
          firstName: coapplicant.firstName,
          lastName: coapplicant.lastName
        },
        isLessee: true,
        residences: [],
        type: coapplicant.type
      };

      await service.submitToYardiService(
        application,
        amountPaid,
        authorization,
        ipAddress
      );

      expect(yardiService.createApplicant).toHaveBeenCalledWith(
        '23142',
        'guestcard123',
        expectedRequest
      );
    });
    it('deletes coapplicants that were created when submission fails', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2023-02-02T18:59:15.326Z'));
      const coapplicant = coapplicantFixture();
      application.formData.coapplicants.coapplicants = [coapplicant];
      application.integrationData.yardi.guestcardId = 'guestcard123';
      application.integrationData.yardi.applicantId = 'applicant456';

      jest.spyOn(yardiService, 'submitApplication').mockImplementation(() => {
        throw new Error('some error');
      });

      jest.spyOn(yardiService, 'createApplicant').mockResolvedValue({
        applicants: [{ ...coapplicant, applicantId: 'applicant456' }]
      });

      const expectedRequest = {
        audit: { submittedAt: '2023-02-02T18:59:15.326Z' },
        contactDetails: {
          email: coapplicant.email,
          firstName: coapplicant.firstName,
          lastName: coapplicant.lastName
        },
        isLessee: true,
        residences: [],
        type: coapplicant.type
      };

      await expect(
        service.submitToYardiService(
          application,
          amountPaid,
          authorization,
          ipAddress
        )
      ).rejects.toThrowError('some error');

      expect(yardiService.createApplicant).toHaveBeenCalledWith(
        '23142',
        'guestcard123',
        expectedRequest
      );
      expect(yardiService.deleteApplicant).toHaveBeenCalledWith(
        '23142',
        'guestcard123',
        'applicant456'
      );
    });
    it('when a coapplicant creation fails it deletes previously created applicants', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2023-02-02T18:59:15.326Z'));
      const coapplicant1 = coapplicantFixture();
      const coapplicant2 = coapplicantFixture();
      application.formData.coapplicants.coapplicants = [
        coapplicant1,
        coapplicant2
      ];
      application.integrationData.yardi.guestcardId = 'guestcard123';
      application.integrationData.yardi.applicantId = 'applicant456';

      jest.spyOn(yardiService, 'createApplicant').mockResolvedValueOnce({
        applicants: [{ ...coapplicant1, applicantId: 'applicant111' }]
      });

      jest.spyOn(yardiService, 'createApplicant').mockImplementationOnce(() => {
        throw new Error('some error');
      });

      await expect(
        service.submitToYardiService(
          application,
          amountPaid,
          authorization,
          ipAddress
        )
      ).rejects.toThrowError('some error');

      expect(yardiService.createApplicant).toHaveBeenCalledTimes(2);
      expect(yardiService.createApplicant).toHaveBeenCalledWith(
        '23142',
        'guestcard123',
        {
          audit: { submittedAt: '2023-02-02T18:59:15.326Z' },
          contactDetails: {
            email: coapplicant1.email,
            firstName: coapplicant1.firstName,
            lastName: coapplicant1.lastName
          },
          isLessee: true,
          residences: [],
          type: coapplicant1.type
        }
      );
      expect(yardiService.createApplicant).toHaveBeenCalledWith(
        '23142',
        'guestcard123',
        {
          audit: { submittedAt: '2023-02-02T18:59:15.326Z' },
          contactDetails: {
            email: coapplicant2.email,
            firstName: coapplicant2.firstName,
            lastName: coapplicant2.lastName
          },
          isLessee: true,
          residences: [],
          type: coapplicant2.type
        }
      );
      expect(yardiService.deleteApplicant).toHaveBeenCalledTimes(1);
      expect(yardiService.deleteApplicant).toHaveBeenCalledWith(
        '23142',
        'guestcard123',
        'applicant111'
      );
    });

    it('handles delete failures and continues deleting other created applicants', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2023-02-02T18:59:15.326Z'));
      const coapplicant1 = coapplicantFixture();
      const coapplicant2 = coapplicantFixture();
      application.formData.coapplicants.coapplicants = [
        coapplicant1,
        coapplicant2
      ];
      application.integrationData.yardi.guestcardId = 'guestcard123';
      application.integrationData.yardi.applicantId = 'applicant456';

      jest.spyOn(yardiService, 'submitApplication').mockImplementation(() => {
        throw new Error('some submit error');
      });

      jest.spyOn(yardiService, 'createApplicant').mockResolvedValueOnce({
        applicants: [{ ...coapplicant1, applicantId: 'applicant111' }]
      });

      jest.spyOn(yardiService, 'createApplicant').mockResolvedValueOnce({
        applicants: [{ ...coapplicant2, applicantId: 'applicant222' }]
      });

      jest.spyOn(yardiService, 'deleteApplicant').mockImplementation(() => {
        throw new Error('deletion error!');
      });

      await expect(
        service.submitToYardiService(
          application,
          amountPaid,
          authorization,
          ipAddress
        )
      ).rejects.toThrowError('some submit error');

      expect(yardiService.deleteApplicant).toHaveBeenCalledTimes(2);
      expect(yardiService.deleteApplicant).toHaveBeenNthCalledWith(
        1,
        '23142',
        'guestcard123',
        'applicant111'
      );
      expect(yardiService.deleteApplicant).toHaveBeenNthCalledWith(
        2,
        '23142',
        'guestcard123',
        'applicant222'
      );
    });

    it('skips when coapplicants are empty', async () => {
      application.formData.coapplicants.coapplicants = undefined;

      await service.submitToYardiService(
        application,
        amountPaid,
        authorization,
        ipAddress
      );

      expect(yardiService.createApplicant).not.toHaveBeenCalled();
      expect(yardiService.deleteApplicant).not.toHaveBeenCalled();
    });
  });
});

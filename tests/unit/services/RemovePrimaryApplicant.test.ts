import * as service from '$lib/services/RemovePrimaryApplicant';
import * as readRepo from '$lib/repositories/leasing-application/read-application';
import * as updateRepo from '$lib/repositories/leasing-application/update-application';
import * as transactions from '$lib/repositories/leasing-application/transaction-items';

jest.mock('$lib/repositories/leasing-application/transaction-items', () => {
  return {
    promoteApplicantTransctionItem: jest.fn(),
    updatePrimaryApplicationTransactionItem: jest.fn()
  };
});

jest.mock('$lib/repositories/leasing-application/read-application', () => {
  return {
    listApplicationsByGuestcard: jest.fn()
  };
});

jest.mock('$lib/repositories/leasing-application/update-application', () => {
  return {
    updatePromotedApplication: jest.fn()
  };
});

jest.mock('$lib/repositories/leasing-application/transaction-items', () => {
  return {
    promoteApplicantTransactionItem: jest.fn(),
    updatePrimaryApplicationTransactionItem: jest.fn()
  };
});

describe('Remove Primary Applicant service', () => {
  let originalGuestcardId: any;
  let newGuestcardId: any;
  let newApplicantsYardiInfo: any;
  let applications: any;
  let applicationsByApplicantId: any;

  beforeEach(() => {
    originalGuestcardId = 'old-guestcard-id';
    newGuestcardId = 'new-guestcard-id';
    newApplicantsYardiInfo = [
      { originalApplicantId: 'applicant-1', newApplicantId: newGuestcardId },
      { originalApplicantId: 'applicant-2', newApplicantId: 'new-applicant-2' }
    ];
    applications = [
      {
        applicationId: 'application-1',
        integrationData: {
          yardi: {
            applicantId: 'applicant-1',
            guestcardId: originalGuestcardId
          }
        }
      },
      {
        applicationId: 'application-2',
        integrationData: {
          yardi: {
            applicantId: 'applicant-2',
            guestcardId: originalGuestcardId
          }
        }
      }
    ];
    applicationsByApplicantId = {
      'applicant-1': applications[0],
      'appllicant-2': applications[1]
    };

    jest
      .spyOn(readRepo, 'listApplicationsByGuestcard')
      .mockResolvedValue(applications);
    jest.spyOn(updateRepo, 'updatePromotedApplication');
    jest
      .spyOn(transactions, 'promoteApplicantTransactionItem')
      .mockReturnValue('promoted-transaction' as any);
    jest
      .spyOn(transactions, 'updatePrimaryApplicationTransactionItem')
      .mockReturnValue('coapplicant-transaction' as any);
  });

  describe('getPromotedApplicationInfo', () => {
    it('returns promoted application and other applications', () => {
      const res = service.getPromotedApplicationInfo(
        newApplicantsYardiInfo,
        applicationsByApplicantId,
        newGuestcardId
      );

      expect(res).toHaveProperty('promotedInfo');
      expect(res).toHaveProperty('otherApplicantsInfo');
    });

    it('throws if there is no applicant to be promoted', () => {
      newApplicantsYardiInfo[0].newApplicantId = 'something-else';

      expect(() =>
        service.getPromotedApplicationInfo(
          newApplicantsYardiInfo,
          applicationsByApplicantId,
          newGuestcardId
        )
      ).toThrowError('No applicant is set to be promoted');
    });
  });

  describe('updateApplicants', () => {
    beforeEach(() => {
      jest.spyOn(service, 'getPromotedApplicationInfo').mockReturnValue({
        promotedInfo: {
          application: applications[0],
          applicantId: newGuestcardId
        },
        otherApplicantsInfo: [
          {
            application: applications[1],
            applicantId: 'new-applicant-2'
          }
        ]
      });
    });
    it('calls `updatePromotedApplication` with transactions', async () => {
      await service.updateApplicants(
        originalGuestcardId,
        newGuestcardId,
        newApplicantsYardiInfo
      );

      expect(
        transactions.promoteApplicantTransactionItem
      ).toHaveBeenCalledTimes(1);
      expect(
        transactions.updatePrimaryApplicationTransactionItem
      ).toHaveBeenCalledTimes(1);
      expect(updateRepo.updatePromotedApplication).toHaveBeenCalledWith([
        'promoted-transaction',
        'coapplicant-transaction'
      ]);
    });
  });
});

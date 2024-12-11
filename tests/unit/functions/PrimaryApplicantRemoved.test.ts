import * as service from '$lib/services/RemovePrimaryApplicant';
import * as lambda from '$functions/PrimaryApplicantRemoved';

jest.mock('$lib/services/RemovePrimaryApplicant', () => {
  return {
    updateApplicants: jest.fn()
  };
});

describe('PrimaryApplicantRemoved event handler tests', () => {
  describe('eventCallback', () => {
    let event: any;
    let results: any;
    beforeEach(() => {
      results = {
        originalGuestcardId: 'original-guestcard-id',
        newGuestcardId: 'new-guestcard-id',
        applicants: [
          {
            originalApplicantId: 'original-applicant-1',
            newApplicantId: 'new-applicant-1'
          },
          {
            originalApplicantId: 'original-applicant-2',
            newApplicantId: 'new-applicant-2'
          }
        ]
      };

      event = { detail: { data: { applicationPromotionResults: results } } };

      jest.spyOn(service, 'updateApplicants');
      jest.spyOn(console, 'error');
    });

    it('calls service with correct arguments', async () => {
      await lambda.eventCallback(event, null as any, null as any);

      expect(service.updateApplicants).toHaveBeenCalledWith(
        'original-guestcard-id',
        results.newGuestcardId,
        results.applicants
      );
    });

    it('throws a validation error if the payload is not valid', async () => {
      results.newGuestcardId = undefined;
      await expect(
        lambda.eventCallback(event, null as any, null as any)
      ).rejects.toThrow();

      expect(service.updateApplicants).not.toHaveBeenCalled();
    });
  });
});

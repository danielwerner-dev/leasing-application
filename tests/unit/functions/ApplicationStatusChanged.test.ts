import * as lambda from '$functions/ApplicationStatusChanged';
import * as service from '$lib/services/SetYardiOwned';

jest.mock('$lib/services/SetYardiOwned', () => {
  return {
    setYardiOwned: jest.fn()
  };
});

describe('ApplicationStatusChanged lambda function', () => {
  describe('eventCallback', () => {
    let event: any;
    let detail: any;
    let data: any;
    let guestcardId: any;
    beforeEach(() => {
      guestcardId = 'guestcard-id';
      data = {
        applicationStatusChangedResults: {
          guestcardId,
          status: 'Approved'
        }
      };

      detail = { data };
      event = { detail };
    });

    it('calls setYardiOwned if payload is valid', async () => {
      await lambda.eventCallback(event, null as any, null as any);

      expect(service.setYardiOwned).toHaveBeenCalledWith(guestcardId);
    });

    it('throws a validation error if data is invalid', async () => {
      data.applicationStatusChangedResults.status = 'Pending';
      await expect(
        lambda.eventCallback(event, null as any, null as any)
      ).rejects.toThrow();
    });

    it('throws any other error logging the error', async () => {
      jest
        .spyOn(service, 'setYardiOwned')
        .mockRejectedValue(new Error('testing error'));

      await expect(
        lambda.eventCallback(event, null as any, null as any)
      ).rejects.toThrowError('testing error');
    });
  });
});

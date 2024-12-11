import * as service from '$lib/services/SetYardiOwned';
import * as repo from '$lib/repositories/leasing-application/update-application';

jest.mock('$lib/repositories/leasing-application/update-application', () => {
  return {
    updateApplicationYardiOwned: jest.fn()
  };
});

describe('SetYardiOwned service', () => {
  describe('setYardiOwned', () => {
    let guestcardId: any;
    beforeEach(() => {
      guestcardId = 'guestcard-id';

      jest.spyOn(repo, 'updateApplicationYardiOwned');
    });

    it('calls updateApplicationYardiOwned with yardiOwned as `true`', async () => {
      await service.setYardiOwned(guestcardId);

      expect(repo.updateApplicationYardiOwned).toHaveBeenCalledWith(
        guestcardId,
        true
      );
    });
  });
});

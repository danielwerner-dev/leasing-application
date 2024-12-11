import * as service from '$lib/services/GetApplicationStatus';
import { applicationFixture } from '$fixtures/index';
import * as yardiService from '$lib/connectors/yardi-service';

jest.mock('$lib/connectors/yardi-service', () => ({
  getGuestcardStatus: jest.fn()
}));

describe('GetApplicationStatus', () => {
  describe('getApplicationStatus', () => {
    let application: any;
    let guestcardId: any;
    let propertyCode: any;

    beforeEach(() => {
      application = applicationFixture();
      guestcardId = 'guestcard-id';
      propertyCode = 'property-code';

      application.applicationStatus = 'status-from-application';
      application.property.propertyCode = propertyCode;
      application.integrationData.yardi.guestcardId = guestcardId;

      jest
        .spyOn(yardiService, 'getGuestcardStatus')
        .mockResolvedValue('status-from-yardi' as any);
    });

    it('uses application status when yardiOwned is false', async () => {
      application.yardiOwned = false;

      const res = await service.getApplicationStatus(application);

      expect(res).toEqual('status-from-application');
      expect(yardiService.getGuestcardStatus).not.toHaveBeenCalled();
    });

    it('uses guestcard status when yardiOwned is true', async () => {
      application.yardiOwned = true;

      const res = await service.getApplicationStatus(application);

      expect(res).toEqual('status-from-yardi');
      expect(yardiService.getGuestcardStatus).toHaveBeenCalledWith(
        guestcardId,
        propertyCode
      );
    });
  });
});

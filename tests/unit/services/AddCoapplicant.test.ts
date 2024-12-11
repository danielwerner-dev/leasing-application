import { applicationFixture } from '$fixtures';
import { addCoapplicantService } from '$lib/services/AddCoapplicant';
import * as yardi from '$lib/connectors/yardi-service';
import * as service from '$lib/services/CreateCoapplicant';
import * as GuestcardUtils from '$lib/utils/guestcard';
import { guestcardResponseFixture } from '$fixtures/yardi-service/submission';
import { YardiGuestCardResponse } from '$lib/types/yardi.types';

jest.mock('$lib/connectors/yardi-service', () => {
  return {
    postCoapplicant: jest.fn()
  };
});

jest.mock('$lib/utils/guestcard', () => {
  return {
    parseCoapplicantToYardi: jest.fn()
  };
});

jest.mock('$lib/services/CreateCoapplicant', () => {
  return {
    createCoapplicantService: jest.fn()
  };
});

describe('AddCoapplicant service', () => {
  let application;
  let ipAddress;
  let coapplicant;
  let guestcardResponse: YardiGuestCardResponse;
  beforeEach(() => {
    application = applicationFixture();
    ipAddress = '1.2.3.4';
    coapplicant = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example',
      type: 'roommate',
      id: '1'
    };
    guestcardResponse = guestcardResponseFixture();

    jest.spyOn(yardi, 'postCoapplicant').mockResolvedValue(guestcardResponse);
    jest
      .spyOn(GuestcardUtils, 'parseCoapplicantToYardi')
      .mockReturnValue({ applicantId: '1234' } as any);
  });

  it('Throws an error when application does not have a guestcard id', async () => {
    application.integrationData.yardi.guestcardId = null;

    await expect(
      addCoapplicantService(application, coapplicant, ipAddress)
    ).rejects.toThrow();
  });

  it('Calls to create a coapplicant application when Yardi creation is successful', async () => {
    application.formData.coapplicants.coapplicants = [coapplicant];
    guestcardResponse = {
      guestcardId: '1111',
      applicants: [
        {
          applicantId: '2222',
          email: 'john@example'
        }
      ]
    };
    jest.spyOn(yardi, 'postCoapplicant').mockResolvedValue(guestcardResponse);

    await addCoapplicantService(application, coapplicant, ipAddress);

    expect(service.createCoapplicantService).toHaveBeenCalledWith(
      application,
      coapplicant,
      ipAddress,
      { guestcardId: '1111', applicantId: '2222' }
    );
  });
});

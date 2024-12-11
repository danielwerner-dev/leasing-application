import { applicationFixture } from '$fixtures';

import * as updateRepo from '$lib/repositories/leasing-application/update-application';
import * as yardiService from '$lib/connectors/yardi-service';
import * as yardiSchema from '$lib/form-validation/schemas/yardi.schema';
import * as propertyUtil from '$lib/utils/property';

import * as utils from '$lib/utils/guestcard';

jest.mock('$lib/repositories/leasing-application/update-application', () => {
  return {
    updateIntegrationData: jest.fn()
  };
});

jest.mock('$lib/connectors/yardi-service', () => {
  return {
    createGuestCard: jest.fn()
  };
});

jest.mock('$lib/form-validation/schemas/yardi.schema', () => {
  return {
    applicationForYardi: {
      validateSync: jest.fn()
    }
  };
});
jest.mock('$lib/utils/property', () => {
  return {
    parsePuCode: jest.fn()
  };
});

jest.useFakeTimers().setSystemTime(Date.now());

describe('Guestcard utils tests', () => {
  describe('parseCoapplicantToYardi', () => {
    let coapplicant: any;
    beforeEach(() => {
      coapplicant = {
        type: 'roommate',
        firstName: 'John',
        lastName: 'Snow',
        email: 'some@email.com'
      };
    });

    it('parses the coapplicant on success', () => {
      const res = utils.parseCoapplicantToYardi(coapplicant);

      const expectedRes = {
        isLessee: false,
        type: coapplicant.type,
        residences: [],
        contactDetails: {
          firstName: coapplicant.firstName,
          lastName: coapplicant.lastName,
          email: coapplicant.email
        },
        audit: {
          submittedAt: new Date().toISOString()
        }
      };

      expect(res).toEqual(expectedRes);
    });
  });

  describe('buildPrimaryApplicantGuestcard', () => {
    let application: any;
    let guestcard: any;
    beforeEach(() => {
      application = applicationFixture();
      application.formData.general.leaseStartDate = '2022-01-01';
      application.formData.general.leaseEndDate = '2022-01-01';
      application.formData.residence.currentResidence.startDate = '2022-01-01';

      const {
        formData: { general, residence },
        customer,
        property
      } = application;

      guestcard = {
        property: {
          propertyCode: 'property-code',
          streetAddress: property.address1
        },
        applicationData: {
          quotedRent: '0',
          leaseStartDate: '2022-01-01',
          leaseEndDate: '2022-01-01'
        },
        applicants: [
          {
            type: 'prospect',
            isLessee: true,
            audit: {
              submittedAt: new Date().toISOString()
            },
            contactDetails: {
              firstName: general.firstName,
              lastName: general.lastName,
              email: customer.email,
              phoneDigits: general.phone.digits,
              phoneType: general.phone.type || 'cell'
            },
            residences: [
              {
                type: 'current',
                address1: residence.currentResidence.addressLine1,
                city: residence.currentResidence.city || '',
                state: residence.currentResidence.state || '',
                postalCode: residence.currentResidence.zipcode || '',
                startDate: '2022-01-01'
              }
            ]
          }
        ]
      };

      jest
        .spyOn(yardiSchema.applicationForYardi, 'validateSync')
        .mockReturnValue(application as any);
      jest
        .spyOn(propertyUtil, 'parsePuCode')
        .mockReturnValue({ propertyCode: 'property-code' } as any);
    });

    it('returns guestcard on success', () => {
      const res = utils.buildPrimaryApplicantGuestcard(application);

      expect(res).toEqual(guestcard);
      expect(propertyUtil.parsePuCode).toHaveBeenCalledWith(
        application.property.puCode
      );
      expect(yardiSchema.applicationForYardi.validateSync).toHaveBeenCalledWith(
        application
      );
    });

    it('returns guestcard when phoneType is missing', () => {
      application.formData.general.phone.type = null;
      guestcard.applicants[0].contactDetails.phoneType = 'cell';
      const res = utils.buildPrimaryApplicantGuestcard(application);

      expect(res).toEqual(guestcard);
      expect(propertyUtil.parsePuCode).toHaveBeenCalledWith(
        application.property.puCode
      );
      expect(yardiSchema.applicationForYardi.validateSync).toHaveBeenCalledWith(
        application
      );
    });

    it('returns guestcard when residence data is missing', () => {
      application.formData.residence.currentResidence = {
        addressLine1: 'Main St.',
        startDate: '2022-01-01'
      };
      guestcard.applicants[0].residences = [
        {
          type: 'current',
          address1: 'Main St.',
          address2: undefined,
          city: undefined,
          state: undefined,
          postalCode: undefined,
          startDate: '2022-01-01'
        }
      ];

      const res = utils.buildPrimaryApplicantGuestcard(application);

      expect(res).toEqual(guestcard);
      expect(propertyUtil.parsePuCode).toHaveBeenCalledWith(
        application.property.puCode
      );
      expect(yardiSchema.applicationForYardi.validateSync).toHaveBeenCalledWith(
        application
      );
    });

    it('returns guestcard when address is international', () => {
      application.formData.residence.currentResidence = {
        addressLine1:
          'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
        isInternational: true,
        startDate: '2022-01-01'
      };

      guestcard.applicants[0].residences = [
        {
          type: 'current',
          address1:
            'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
          city: undefined,
          state: undefined,
          postalCode: undefined,
          startDate: '2022-01-01'
        }
      ];

      const res = utils.buildPrimaryApplicantGuestcard(application);

      expect(res).toEqual(guestcard);
    });

    it('returns guestcard when phone is international', () => {
      application.formData.general.phone.digits = '+55999999999';
      guestcard.applicants[0].contactDetails.phoneDigits = undefined;

      const res = utils.buildPrimaryApplicantGuestcard(application);

      expect(res).toEqual(guestcard);
    });
  });

  describe('createGuestCard', () => {
    let application: any;
    beforeEach(() => {
      application = applicationFixture();

      jest
        .spyOn(utils, 'buildPrimaryApplicantGuestcard')
        .mockReturnValue('guestcard-request' as any);
      jest.spyOn(yardiService, 'createGuestCard').mockResolvedValue({
        guestcardId: 'guestcard-id',
        applicants: [{ applicantId: 'applicant-id' }]
      } as any);
      jest.spyOn(updateRepo, 'updateIntegrationData');
    });

    it('returns application on success', async () => {
      const res = await utils.createGuestCard(application);

      const expectedIntegrationData = {
        ...application.integrationData,
        yardi: {
          guestcardId: 'guestcard-id',
          applicantId: 'applicant-id'
        }
      };

      const expectedRes = {
        ...application,
        integrationData: expectedIntegrationData
      };

      expect(res).toEqual(expectedRes);
      expect(utils.buildPrimaryApplicantGuestcard).toHaveBeenCalledWith(
        application
      );
      expect(yardiService.createGuestCard).toHaveBeenCalledWith(
        application.property.propertyCode,
        'guestcard-request'
      );
      expect(updateRepo.updateIntegrationData).toHaveBeenCalledWith(
        application.applicationId,
        expectedIntegrationData
      );
    });
  });

  describe('valdiateGuestcardData', () => {
    let application: any;
    beforeEach(() => {
      application = applicationFixture();

      jest
        .spyOn(utils, 'createGuestCard')
        .mockResolvedValue('guestcard' as any);
    });

    it('returns application if guestcardId exists', async () => {
      application.integrationData.yardi.guestcardId = 'guestcard-id';
      const res = await utils.validateGuestcardData(application);

      expect(res).toEqual(application);
      expect(utils.createGuestCard).not.toHaveBeenCalled();
    });

    it('calls createGuestCard if guestcardId does not exists', async () => {
      application.integrationData.yardi.guestcardId = null;
      const res = await utils.validateGuestcardData(application);

      expect(res).toEqual('guestcard');
      expect(utils.createGuestCard).toHaveBeenCalledWith(application);
    });
  });
});

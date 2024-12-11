import * as service from '$lib/services/CreateCoapplicant';
import * as repo from '$lib/repositories/leasing-application/create-application';
import * as customerService from '$lib/connectors/customer-service';
import * as emailService from '$lib/services/EmailCoapplicantInvite';

import { applicationFixture } from '$fixtures';
import {
  yardiCoapplicantFixture,
  yardiInfoFixture
} from '$fixtures/yardi-service/submission';

jest.mock('$lib/connectors/customer-service', () => {
  return {
    getCustomerByEmail: jest.fn()
  };
});

jest.mock('$lib/repositories/leasing-application/create-application', () => {
  return {
    createCoapplicantApplication: jest.fn()
  };
});

jest.mock('$lib/services/EmailCoapplicantInvite', () => {
  return {
    emailCoapplicantInvite: jest.fn()
  };
});

describe('Create Coapplicant Service', () => {
  describe('createCoapplicantService', () => {
    let application;
    let coapplicant;
    let ipAddress;
    let yardiInfo;
    beforeEach(() => {
      ipAddress = '127.0.0.1';
      application = applicationFixture();
      coapplicant = {
        firstName: 'dr',
        lastName: 'dre',
        type: 'roommate',
        email: 'hello@world.com',
        id: '123'
      };

      yardiInfo = yardiInfoFixture();

      jest.spyOn(customerService, 'getCustomerByEmail').mockResolvedValue({
        cusotmerId: 'customer-id'
      } as any);

      jest
        .spyOn(repo, 'createCoapplicantApplication')
        .mockResolvedValue(application);
    });

    it('returns if getCustomerByEmail returns null', async () => {
      jest.spyOn(customerService, 'getCustomerByEmail').mockResolvedValue(null);

      application.applicationStatus = 'pending';
      await service.createCoapplicantService(
        application,
        coapplicant,
        ipAddress,
        yardiInfo
      );

      expect(repo.createCoapplicantApplication).toHaveBeenCalledWith(
        application,
        coapplicant,
        ipAddress,
        { paidById: '', customerId: '' },
        yardiInfo
      );
    });

    it('throws when application status is different than `pending`', async () => {
      application.applicationStatus = 'deleted';
      await expect(
        service.createCoapplicantService(
          application,
          coapplicant,
          ipAddress,
          yardiInfo
        )
      ).rejects.toThrowError(
        `Cannot create co-applicant for application ${application.applicationId} in current status: deleted`
      );

      expect(repo.createCoapplicantApplication).not.toHaveBeenCalled();
      expect(emailService.emailCoapplicantInvite).not.toHaveBeenCalled();
    });
  });

  describe('createCoapplicantApplications', () => {
    let application: any;
    let coapplicants: any;
    let yardi: any;
    let applicantsToPay: any;
    let ipAddress: string;
    beforeEach(() => {
      coapplicants = [yardiCoapplicantFixture()];
      yardi = {
        guestcardId: 'hug-a-tree-today'
      };

      application = applicationFixture();
      application.formData.coapplicants = {
        coapplicants
      };
      application.integrationData = {
        yardi
      };
      ipAddress = '127.0.0.1';
      applicantsToPay = ['king@westeros.gov'];
      jest
        .spyOn(service, 'createCoapplicantService')
        .mockImplementation(jest.fn());
    });

    it('calls createCoapplicantService for each coapplicant', async () => {
      const coapplicant1 = yardiCoapplicantFixture();
      coapplicant1.applicantId = '1';
      coapplicant1.email = 'email1@example.com';
      const coapplicant2 = yardiCoapplicantFixture();
      coapplicant2.applicantId = '2';
      coapplicant2.email = 'email2@example.com';
      applicantsToPay = [coapplicant2.email];

      coapplicants = [coapplicant1, coapplicant2];
      service.createCoapplicantApplications(
        application,
        applicantsToPay,
        ipAddress,
        coapplicants
      );

      expect(service.createCoapplicantService).toHaveBeenCalledTimes(2);
      expect(service.createCoapplicantService).toHaveBeenNthCalledWith(
        1,
        application,
        coapplicant1,
        ipAddress,
        {
          guestcardId: yardi.guestcardId,
          applicantId: coapplicant1.applicantId
        },
        ''
      );
      expect(service.createCoapplicantService).toHaveBeenNthCalledWith(
        2,
        application,
        coapplicant2,
        ipAddress,
        {
          guestcardId: yardi.guestcardId,
          applicantId: coapplicant2.applicantId
        },
        application.customer.customerId
      );
    });

    describe('when coapplicant is not listed in applicantsToPay', () => {
      it('calls createCoapplicantService with empty paidById', async () => {
        const coapplicant = yardiCoapplicantFixture();
        coapplicants = [coapplicant];
        applicantsToPay = [];
        const res = await service.createCoapplicantApplications(
          application,
          applicantsToPay,
          ipAddress,
          coapplicants
        );

        expect(res.length).toBe(1);
        expect(service.createCoapplicantService).toHaveBeenCalledTimes(1);
        expect(service.createCoapplicantService).toHaveBeenCalledWith(
          application,
          coapplicant,
          ipAddress,
          {
            guestcardId: yardi.guestcardId,
            applicantId: coapplicant.applicantId
          },
          ''
        );
      });
    });
  });
});

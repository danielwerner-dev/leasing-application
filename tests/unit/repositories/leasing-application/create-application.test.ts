import * as repo from '$lib/repositories/leasing-application/create-application';
import * as getRepo from '$lib/repositories/leasing-application/read-application';
import * as dbClient from '$lib/repositories/leasing-application/dynamo-client';
import * as uuid from 'uuid';
import * as formValidation from '$lib/utils/form-validation';
import generalSchema from '$lib/form-validation/schemas/form-data/general.schema';
import { applicationFixture } from '$fixtures';
import { yardiInfoFixture } from '$fixtures/yardi-service/submission';

jest.mock('$lib/repositories/leasing-application/dynamo-client', () => {
  return {
    DBClient: {
      update: jest.fn(),
      set: jest.fn(),
      get: jest.fn(),
      query: jest.fn()
    }
  };
});

jest.mock('$lib/utils/form-validation', () => {
  return {
    getValidationContext: jest.fn()
  };
});

jest.mock('$lib/form-validation/schemas/form-data/general.schema', () => {
  return {
    validateSync: jest.fn()
  };
});

jest.mock('$lib/repositories/leasing-application/read-application', () => {
  return {
    getApplication: jest.fn()
  };
});

jest.mock('uuid', () => {
  return {
    v4: jest.fn()
  };
});

jest.useFakeTimers().setSystemTime(new Date('2022-12-5'));

describe('create-application', () => {
  describe('create applications', () => {
    let customer;
    let property;
    let ipAddress;
    let createdApplication;
    beforeEach(() => {
      jest.spyOn(dbClient.DBClient, 'set').mockImplementation(jest.fn());
      createdApplication = applicationFixture();
      jest
        .spyOn(getRepo, 'getApplication')
        .mockResolvedValue(createdApplication);

      jest.spyOn(uuid, 'v4').mockResolvedValue('mock-uuid');

      customer = {
        customerId: '1234',
        email: 'jsnow@westeros.com'
      };

      property = {
        slug: 'property-for-testing'
      };

      ipAddress = '127.0.0.1';
    });

    describe('createPrimaryApplication', () => {
      it('creates an application', async () => {
        await repo.createPrimaryApplication(customer, property, ipAddress);

        const expectedApplication = {
          PK: 'mock-uuid',
          customerId: customer.customerId,
          email: customer.email,
          primaryApplicationId: 'mock-uuid',
          paidById: '',
          applicationType: 'primary',
          property,
          submission: {
            amountPaid: 0,
            paymentMethod: ''
          },
          applicationStatus: 'draft',
          applicationVersion: 'v1',
          formData: {},
          integrationData: {},
          audit: {
            createdAt: new Date().toISOString(),
            createdByIp: ipAddress,
            updatedAt: '',
            updatedByIp: '',
            submittedAt: '',
            submittedByIp: ''
          }
        };

        expect(dbClient.DBClient.set).toHaveBeenCalledWith(expectedApplication);
      });

      it('throws an error if application is not returned', async () => {
        jest.spyOn(getRepo, 'getApplication').mockResolvedValue(null);

        await expect(
          repo.createPrimaryApplication(customer, property, ipAddress)
        ).rejects.toThrow('Error creating application');
      });
    });

    describe('createCoapplicantApplication', () => {
      let primaryApplication;
      let expectedApplication;
      let coapplicant;
      let ipAddress;
      let yardiInfo;
      beforeEach(() => {
        primaryApplication = applicationFixture();
        yardiInfo = yardiInfoFixture();

        coapplicant = {
          email: 'coapplicant@applciation.com',
          firstName: 'John',
          lastName: 'Coapplicant',
          type: 'roommate'
        };

        ipAddress = '127.0.0.1';

        expectedApplication = {
          primaryApplicationId: `${primaryApplication.applicationId}`,
          customerId: 'coapplicant',
          email: coapplicant.email,
          primaryApplicationData: {
            firstName: coapplicant.firstName,
            lastName: coapplicant.lastName,
            applicationType: coapplicant.type,
            leaseStartDate: primaryApplication.formData.general.leaseStartDate,
            leaseTerm: primaryApplication.formData.general.leaseTerm
          },
          paidById: '',
          applicationType: 'coapplicant',
          property: primaryApplication.property,
          submission: {
            amountPaid: 0,
            paymentMethod: ''
          },
          formData: {},
          integrationData: {},
          applicantId: yardiInfo.applicantId,
          guestcardId: yardiInfo.guestcardId,
          applicationStatus: 'created',
          applicationVersion: 'v1',
          audit: {
            createdAt: new Date().toISOString(),
            createdByIp: ipAddress,
            updatedAt: '',
            updatedByIp: '',
            submittedAt: '',
            submittedByIp: ''
          }
        };

        jest
          .spyOn(generalSchema, 'validateSync')
          .mockReturnValue(primaryApplication.formData.general);
        jest
          .spyOn(formValidation, 'getValidationContext')
          .mockReturnValue('context' as any);
      });

      it('creates a co-applicant application without customerId and paidById', async () => {
        expectedApplication.PK = 'mock-uuid';

        await repo.createCoapplicantApplication(
          primaryApplication,
          coapplicant,
          ipAddress,
          {},
          yardiInfo
        );

        expect(dbClient.DBClient.set).toHaveBeenCalledWith(expectedApplication);
        expect(formValidation.getValidationContext).toHaveBeenCalledWith(
          primaryApplication
        );
        expect(generalSchema.validateSync).toHaveBeenCalledWith(
          primaryApplication.formData.general,
          { context: 'context' }
        );
      });

      it('creates a co-applicant application with customerId and paidById', async () => {
        await repo.createCoapplicantApplication(
          primaryApplication,
          coapplicant,
          ipAddress,
          { customerId: '1234', paidById: '1234' },
          yardiInfo
        );

        expectedApplication.PK = 'mock-uuid';
        expectedApplication.paidById = '1234';
        expectedApplication.customerId = '1234';
        expectedApplication.applicationStatus = 'draft';

        expect(dbClient.DBClient.set).toHaveBeenCalledWith(expectedApplication);
      });

      it('throws an error when the application is not returned', async () => {
        jest.spyOn(getRepo, 'getApplication').mockResolvedValue(null);

        await expect(
          repo.createCoapplicantApplication(
            primaryApplication,
            coapplicant,
            ipAddress,
            {},
            yardiInfo
          )
        ).rejects.toThrow('Error creating coapplicant application');
      });
    });
  });
});

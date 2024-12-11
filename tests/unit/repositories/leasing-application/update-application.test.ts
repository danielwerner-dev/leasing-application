import * as updateApplication from '$lib/repositories/leasing-application/update-application';
import * as dbClient from '$lib/repositories/leasing-application/dynamo-client';
import * as readApplication from '$lib/repositories/leasing-application/read-application';
import * as TransactionItems from '$lib/repositories/leasing-application/transaction-items';
import { applicationFixture, integrationDataFixture } from '$fixtures';
import { ApplicationStatus } from '$lib/types/Application.types';
import { TransactionType } from '$lib/types/repository.types';

jest.mock('$lib/repositories/leasing-application/transaction-items', () => {
  return {
    yardiOwnedTransactionItem: jest.fn(),
    paidByIdTransactionItem: jest.fn()
  };
});

jest.mock('$lib/repositories/leasing-application/dynamo-client', () => {
  return {
    DBClient: {
      update: jest.fn(),
      get: jest.fn(),
      set: jest.fn(),
      query: jest.fn(),
      executeTransaction: jest.fn()
    }
  };
});

jest.mock('$lib/repositories/leasing-application/read-application', () => {
  return {
    getApplication: jest.fn()
  };
});

jest.useFakeTimers().setSystemTime(new Date('2022-12-5'));

describe('update-application', () => {
  let application;
  beforeEach(() => {
    jest.spyOn(dbClient.DBClient, 'update');

    application = applicationFixture();
  });

  describe('updateFormData', () => {
    let formData;
    let ipAddress;
    beforeEach(() => {
      formData = {
        general: {
          firstName: 'John',
          lastName: 'Snow'
        }
      };
      ipAddress = '127.0.0.1';
    });

    describe('when data is valid', () => {
      it('calls DBClient.update and return expected application', async () => {
        jest.spyOn(readApplication, 'getApplication').mockImplementation(() => {
          return application;
        });

        const expectedApplication = {
          ...application,
          formData: {
            ...application.formData,
            ...formData
          }
        };

        const udpatedApplication = await updateApplication.updateFormData(
          application.applicationId,
          formData,
          ipAddress
        );

        expect(dbClient.DBClient.update).toHaveBeenCalled();
        expect(udpatedApplication).toStrictEqual(expectedApplication);
      });

      it('returns application when current formData is empty', async () => {
        jest.spyOn(readApplication, 'getApplication').mockImplementation(() => {
          application.formData = {};
          return application;
        });

        const expectedApplication = {
          ...application,
          formData: {
            ...formData
          }
        };

        const udpatedApplication = await updateApplication.updateFormData(
          application.applicationId,
          formData,
          ipAddress
        );

        expect(dbClient.DBClient.update).toHaveBeenCalled();
        expect(udpatedApplication).toStrictEqual(expectedApplication);
      });

      it('returns application when current formData is undefined', async () => {
        jest.spyOn(readApplication, 'getApplication').mockImplementation(() => {
          application.formData = undefined;
          return application;
        });

        const expectedApplication = {
          ...application,
          formData: {
            ...formData
          }
        };

        const udpatedApplication = await updateApplication.updateFormData(
          application.applicationId,
          formData,
          ipAddress
        );

        expect(dbClient.DBClient.update).toHaveBeenCalled();
        expect(udpatedApplication).toStrictEqual(expectedApplication);
      });
    });

    describe('when data is invalid', () => {
      it('throws when application is not found', async () => {
        jest.spyOn(readApplication, 'getApplication').mockResolvedValue(null);
        await expect(
          updateApplication.updateFormData(application, formData, ipAddress)
        ).rejects.toThrowError('Application not found');

        expect(dbClient.DBClient.update).not.toHaveBeenCalled();
      });

      it('throws when application status is deleted', async () => {
        jest.spyOn(readApplication, 'getApplication').mockImplementation(() => {
          const application: any = applicationFixture();
          application.applicationStatus = 'deleted';
          return application;
        });

        await expect(
          updateApplication.updateFormData(application, formData, ipAddress)
        ).rejects.toThrowError('Cannot update application with status deleted');
      });
    });
  });

  describe('udpateApplicationExistingCustomer', () => {
    it('calls DBClient.update with correct attributes', async () => {
      jest.spyOn(dbClient.DBClient, 'update');

      const applicationId = '1234';
      const customerId = '4321';
      const email = 'test@test.com';
      const now = new Date().toISOString();

      const expectedExpression =
        'SET customerId = :customerId, email = :email, audit.updatedAt = :now';
      const expectedAttributes = {
        ':customerId': customerId,
        ':email': email,
        ':now': now
      };

      await updateApplication.updateApplicationExistingCustomer(
        applicationId,
        customerId,
        email
      );

      expect(dbClient.DBClient.update).toHaveBeenCalledWith(
        applicationId,
        expectedExpression,
        expectedAttributes
      );
    });
  });

  describe('udpateApplicationNewCustomer', () => {
    it('calls DBClient.update with correct attributes', async () => {
      jest
        .spyOn(updateApplication, 'updateApplicationExistingCustomer')
        .mockImplementation(jest.fn());

      const applicationId = '1234';
      const email = 'test@test.com';
      await updateApplication.updateApplicationNewCustomer(
        applicationId,
        email
      );

      expect(
        updateApplication.updateApplicationExistingCustomer
      ).toHaveBeenCalledWith(applicationId, 'coapplicant', email);
    });
  });

  describe('updateIntegrationData', () => {
    let integrationData;
    beforeEach(() => {
      integrationData = integrationDataFixture();
    });

    it('calls DBClient.update with the correct arguments', async () => {
      const applicationId = '1234';

      const expectedExpression =
        'SET guestcardId = :guestcardId, applicantId = :applicantId, integrationData = :integrationData, audit.updatedAt = :now';
      const expectedIntegration = integrationData;
      delete expectedIntegration.yardi.applicantId;
      delete expectedIntegration.yardi.guestcardId;

      const expectedAttributes = {
        ':integrationData': expectedIntegration,
        ':now': new Date().toISOString()
      };

      await updateApplication.updateIntegrationData(
        applicationId,
        integrationData
      );

      expect(dbClient.DBClient.update).toHaveBeenCalledWith(
        applicationId,
        expectedExpression,
        expectedAttributes
      );
    });
  });

  describe('updateCompletedApplication', () => {
    beforeEach(() => {
      jest
        .spyOn(readApplication, 'getApplication')
        .mockResolvedValue(applicationFixture());
    });
    it('calls DBClient.update with the correct arguments', async () => {
      const applicationId = '1234';
      const amountPaid = 50;
      const paymentMethod = 'ACH';

      const expectedExpression =
        'SET applicationStatus = :pendingStatus, ' +
        'yardiOwned = :yardiOwned, ' +
        'submission.amountPaid = :amountPaid, ' +
        'submission.paymentMethod = :paymentMethod, ' +
        'audit.submissionStatus = :statusSuccess';

      const expectedAttributes = {
        ':pendingStatus': 'pending',
        ':yardiOwned': true,
        ':amountPaid': amountPaid,
        ':paymentMethod': paymentMethod,
        ':statusSuccess': 'success'
      };

      await updateApplication.updateCompletedApplication(applicationId, {
        amountPaid,
        paymentMethod
      });

      expect(dbClient.DBClient.update).toHaveBeenCalledWith(
        applicationId,
        expectedExpression,
        expectedAttributes
      );
    });

    it('throws an error if application is not found', async () => {
      jest.spyOn(readApplication, 'getApplication').mockResolvedValue(null);

      await expect(
        updateApplication.updateCompletedApplication('applicationId', {
          amountPaid: 123,
          paymentMethod: 'method'
        })
      ).rejects.toThrowError('Error loading updated application');
    });
  });

  describe('updateApplicationStatus', () => {
    it('calls DBClient.update with the correct arguments', async () => {
      const applicationId = '1234';
      const applicationStatus = ApplicationStatus.created;

      const expectedExpression = 'SET applicationStatus = :applicationStatus';
      const expectedAttributes = {
        ':applicationStatus': applicationStatus
      };

      await updateApplication.updateApplicationStatus(
        applicationId,
        applicationStatus
      );

      expect(dbClient.DBClient.update).toHaveBeenCalledWith(
        applicationId,
        expectedExpression,
        expectedAttributes
      );
    });
  });

  describe('updatePromotedApplication', () => {
    beforeEach(() => {
      jest.spyOn(dbClient.DBClient, 'executeTransaction');
    });

    it('calls DBClient.update with the correct arguments', async () => {
      await updateApplication.updatePromotedApplication([
        'testing',
        'transaction',
        'call'
      ] as any);

      expect(dbClient.DBClient.executeTransaction).toHaveBeenCalledWith([
        'testing',
        'transaction',
        'call'
      ]);
    });
  });

  describe('updateApplicationProperty', () => {
    it('Updates the property for an application', async () => {
      const applications = [applicationFixture()];

      await updateApplication.updateApplicationProperty(
        applications[0].applicationId,
        {} as any
      );

      expect(dbClient.DBClient.update).toHaveBeenCalled();
    });
  });

  describe('updatePaidById', () => {
    beforeEach(() => {
      jest
        .spyOn(TransactionItems, 'paidByIdTransactionItem')
        .mockReturnValue({});
    });
    it('builds a transaction and calls the db client', async () => {
      const applications = [applicationFixture()];

      await updateApplication.updatePaidByIdTransaction(
        applications,
        'paidById',
        TransactionType.FAIL_WHEN_EXISTS
      );

      expect(dbClient.DBClient.executeTransaction).toHaveBeenCalled();
    });

    it('throws an error if transaction fails', async () => {
      const applications = [applicationFixture()];
      jest
        .spyOn(dbClient.DBClient, 'executeTransaction')
        .mockImplementation(() => Promise.reject('value'));

      await expect(
        updateApplication.updatePaidByIdTransaction(
          applications,
          'paidById',
          TransactionType.FAIL_WHEN_EXISTS
        )
      ).rejects.toThrow('One or more applications could not be paid for');
    });
  });

  describe('updateApplicationYardiOwned', () => {
    let guestcardId: any;
    let yardiOwned: any;
    beforeEach(() => {
      guestcardId = 'guestcard-id';
      yardiOwned = true;

      jest.spyOn(dbClient.DBClient, 'query').mockResolvedValue({
        Items: [{ PK: '1' }, { PK: '2' }, { PK: '3' }]
      } as any);
      jest.spyOn(dbClient.DBClient, 'executeTransaction');
      jest
        .spyOn(TransactionItems, 'yardiOwnedTransactionItem')
        .mockReturnValue('ok' as any);
    });

    it('calls DBClient.update with correct key, expression and attributes', async () => {
      await updateApplication.updateApplicationYardiOwned(
        guestcardId,
        yardiOwned
      );

      expect(dbClient.DBClient.query).toHaveBeenCalled();
      expect(TransactionItems.yardiOwnedTransactionItem).toHaveBeenCalledWith(
        '1',
        true
      );
      expect(TransactionItems.yardiOwnedTransactionItem).toHaveBeenCalledWith(
        '2',
        true
      );
      expect(TransactionItems.yardiOwnedTransactionItem).toHaveBeenCalledWith(
        '3',
        true
      );
      expect(dbClient.DBClient.executeTransaction).toHaveBeenCalledWith([
        'ok',
        'ok',
        'ok'
      ]);
    });

    it('sets applications as empty array if db returns undefined', async () => {
      jest.spyOn(dbClient.DBClient, 'query').mockResolvedValue({} as any);

      await updateApplication.updateApplicationYardiOwned(
        guestcardId,
        yardiOwned
      );
    });
  });

  describe('updateApplicationSubmissionStatus', () => {
    let application: any;
    let status: any;
    beforeEach(() => {
      application = {
        applicationId: 'application-id'
      };
      status = 'test-status';

      jest.spyOn(dbClient.DBClient, 'update');
    });

    it('calls the DBClient with the expected expression and attributes', async () => {
      await updateApplication.updateApplicationSubmissionStatus(
        application,
        status
      );

      const expression = 'SET audit.submissionStatus = :status';
      const attributes = {
        ':status': status
      };

      expect(dbClient.DBClient.update).toHaveBeenCalledWith(
        'application-id',
        expression,
        attributes
      );
    });
  });

  describe('updateApplicationStartSubmission', () => {
    let application: any;
    let ipAddress: any;
    beforeEach(() => {
      application = {
        applicationId: 'application-id'
      };
      ipAddress = '127.0.0.1';

      jest.spyOn(dbClient.DBClient, 'update');
    });

    it('calls the DBClient with the expected expression and attributes', async () => {
      await updateApplication.updateApplicationStartSubmission(
        application,
        ipAddress
      );

      const now = new Date().toISOString();

      const expression =
        'SET audit.submissionStatus = :status, ' +
        'audit.submittedAt = :now, ' +
        'audit.submittedByIp = :ipAddress';
      const attributes = {
        ':status': 'in-progress',
        ':now': now,
        ':ipAddress': ipAddress
      };

      expect(dbClient.DBClient.update).toHaveBeenCalledWith(
        'application-id',
        expression,
        attributes
      );
    });
  });

  describe('updateApplicationExternalFields', () => {
    let applicationId: any;
    let externalFields: any;
    beforeEach(() => {
      applicationId = 'application-id';
      externalFields = {
        yardi: 'yardi-data',
        property: 'property-data'
      };

      jest.spyOn(dbClient.DBClient, 'update');
    });

    it('calls DBClient.update with expected arguments', async () => {
      await updateApplication.updateApplicationExternalFields(
        applicationId,
        externalFields
      );

      const now = new Date().toISOString();

      const expression =
        'SET #property = :property, ' +
        'integrationData.yardi = :yardi, ' +
        'audit.updatedAt = :now';

      const attributes = {
        ':property': externalFields.property,
        ':yardi': externalFields.yardi,
        ':now': now
      };

      const attributeNames = {
        '#property': 'property'
      };

      expect(dbClient.DBClient.update).toHaveBeenCalledWith(
        applicationId,
        expression,
        attributes,
        { attributeNames }
      );
    });
  });
});

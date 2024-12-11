import * as DBUtils from '$lib/utils/db';
import * as repo from '$lib/repositories/leasing-application/transaction-items';

jest.mock('$lib/utils/db', () => {
  return {
    transactionUpdateItem: jest.fn()
  };
});

describe('Transaction items', () => {
  describe('yardiOwnedTransactionItem', () => {
    let applicationId: any;
    let yardiOwned: any;
    beforeEach(() => {
      applicationId = 'application-id';
      yardiOwned = true;

      jest.spyOn(DBUtils, 'transactionUpdateItem');
    });

    it('calls transactionUpdateItem', () => {
      repo.yardiOwnedTransactionItem(applicationId, yardiOwned);

      const expression = 'SET yardiOwned = :yardiOwned';
      const attributes = {
        ':yardiOwned': { BOOL: yardiOwned }
      };

      expect(DBUtils.transactionUpdateItem).toHaveBeenCalledWith(
        applicationId,
        expression,
        attributes
      );
    });
  });

  describe('paidByIdTransactionItem', () => {
    let application: any;
    let transactionType: any;
    let now: any;
    let paidById: any;
    let expression: any;
    let attributes: any;
    let options: any;
    beforeEach(() => {
      application = {
        applicationId: 'application-id'
      };
      transactionType = 'overwrite';
      now = new Date().toISOString();
      paidById = 'customer-id';

      expression = 'SET paidById = :paidById, audit.updatedAt = :now';
      attributes = {
        ':paidById': { S: paidById },
        ':now': { S: now }
      };
      options = {};

      jest.spyOn(DBUtils, 'transactionUpdateItem');
    });

    it('calls transactionUpdateItem with the correct arguments when type is overwrite', () => {
      repo.paidByIdTransactionItem(application, transactionType, now, paidById);

      expect(DBUtils.transactionUpdateItem).toHaveBeenCalledWith(
        application.applicationId,
        expression,
        attributes,
        options
      );
    });

    it('calls transactionUpdateItem with the correct arguments when type is fail-when-exists', () => {
      attributes[':emptyPaidById'] = { S: '' };
      options['conditionExpression'] = 'paidById = :emptyPaidById';
      transactionType = 'fail-when-exists';

      repo.paidByIdTransactionItem(application, transactionType, now, paidById);

      expect(DBUtils.transactionUpdateItem).toHaveBeenCalledWith(
        application.applicationId,
        expression,
        attributes,
        options
      );
    });
  });

  describe('promoteApplicantTransactionItem', () => {
    let application: any;
    let guestcardId: any;
    let applicantId: any;
    beforeEach(() => {
      application = {
        applicationId: '1234'
      };
      guestcardId = 'guestcard-id';
      applicantId = 'applicant-id';

      jest.spyOn(DBUtils, 'transactionUpdateItem');
    });

    it('calls `transactionUpdateItem` with correct arguments', () => {
      repo.promoteApplicantTransactionItem(application, {
        guestcardId,
        applicantId
      });

      const expression =
        'SET applicationType = :primary, guestcardId = :guestcardId, applicantId = :applicantId, primaryApplicationId = :applicationId, integrationData.yardi = :yardi, promoted = :promoted, audit.updatedAt = :now';

      const attributes: any = {
        ':primary': { S: 'primary' },
        ':guestcardId': { S: guestcardId },
        ':applicantId': { S: applicantId },
        ':applicationId': { S: application.applicationId },
        ':yardi': { M: {} },
        ':promoted': { BOOL: true },
        ':now': { S: new Date().toISOString() }
      };

      expect(DBUtils.transactionUpdateItem).toHaveBeenCalledWith(
        application.applicationId,
        expression,
        attributes
      );
    });
  });

  describe('updatePrimaryApplicationTransactionItem', () => {
    let application: any;
    let guestcardId: any;
    let applicantId: any;
    let promotedApplicationId: any;
    beforeEach(() => {
      application = {
        applicationId: '1234'
      };
      guestcardId = 'guestcard-id';
      applicantId = 'applicant-id';
      promotedApplicationId = 'promoted-id';

      jest.spyOn(DBUtils, 'transactionUpdateItem');
    });

    it('calls `transactionUpdateItem` with correct arguments', () => {
      repo.updatePrimaryApplicationTransactionItem(application, {
        guestcardId,
        applicantId,
        promotedApplicationId
      });

      const expression =
        'SET primaryApplicationId = :promotedApplicationId, guestcardId = :guestcardId, applicantId = :applicantId, integrationData.yardi = :yardi, audit.updatedAt = :now';

      const attributes: any = {
        ':promotedApplicationId': { S: promotedApplicationId },
        ':guestcardId': { S: guestcardId },
        ':applicantId': { S: applicantId },
        ':yardi': { M: {} },
        ':now': { S: new Date().toISOString() }
      };

      expect(DBUtils.transactionUpdateItem).toHaveBeenCalledWith(
        application.applicationId,
        expression,
        attributes
      );
    });
  });
});

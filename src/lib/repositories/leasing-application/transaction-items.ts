import { YardiBasicInfo } from '$lib/form-validation/schemas/integration-data/yardi-integration-data.schema';
import { Application, ApplicationType } from '$lib/types/Application.types';
import { TransactionType } from '$lib/types/repository.types';
import { transactionUpdateItem } from '$lib/utils/db';
import { AttributeValue } from '@aws-sdk/client-dynamodb';

interface PrimaryApplicantRemovedInfo extends YardiBasicInfo {
  promotedApplicationId: string;
}

export const yardiOwnedTransactionItem = (
  applicationId: string,
  yardiOwned: boolean
) => {
  const expression = 'SET yardiOwned = :yardiOwned';
  const attributes: Record<string, AttributeValue> = {
    ':yardiOwned': { BOOL: yardiOwned }
  };

  return transactionUpdateItem(applicationId, expression, attributes);
};

export const paidByIdTransactionItem = (
  application: Application,
  transactionType: TransactionType,
  now: string,
  paidById: string
) => {
  const expression = 'SET paidById = :paidById, audit.updatedAt = :now';
  const attributes: Record<string, AttributeValue> = {
    ':paidById': { S: paidById },
    ':now': { S: now }
  };
  const options = {};

  if (transactionType === TransactionType.FAIL_WHEN_EXISTS) {
    attributes[':emptyPaidById'] = { S: '' };
    options['conditionExpression'] = 'paidById = :emptyPaidById';
  }

  return transactionUpdateItem(
    application.applicationId,
    expression,
    attributes,
    options
  );
};

export const promoteApplicantTransactionItem = (
  application: Application,
  { guestcardId, applicantId }: YardiBasicInfo
) => {
  const expression = [
    'SET applicationType = :primary',
    'guestcardId = :guestcardId',
    'applicantId = :applicantId',
    'primaryApplicationId = :applicationId',
    'integrationData.yardi = :yardi',
    'promoted = :promoted',
    'audit.updatedAt = :now'
  ].join(', ');
  const attributes: Record<string, AttributeValue> = {
    ':primary': { S: ApplicationType.primary },
    ':guestcardId': { S: guestcardId },
    ':applicantId': { S: applicantId },
    ':applicationId': { S: application.applicationId },
    ':yardi': { M: {} },
    ':promoted': { BOOL: true },
    ':now': { S: new Date().toISOString() }
  };

  return transactionUpdateItem(
    application.applicationId,
    expression,
    attributes
  );
};

export const updatePrimaryApplicationTransactionItem = (
  application: Application,
  {
    guestcardId,
    applicantId,
    promotedApplicationId
  }: PrimaryApplicantRemovedInfo
) => {
  const expression = [
    'SET primaryApplicationId = :promotedApplicationId',
    'guestcardId = :guestcardId',
    'applicantId = :applicantId',
    'integrationData.yardi = :yardi',
    'audit.updatedAt = :now'
  ].join(', ');
  const attributes: Record<string, AttributeValue> = {
    ':promotedApplicationId': { S: promotedApplicationId },
    ':guestcardId': { S: guestcardId },
    ':applicantId': { S: applicantId },
    ':yardi': { M: {} },
    ':now': { S: new Date().toISOString() }
  };

  return transactionUpdateItem(
    application.applicationId,
    expression,
    attributes
  );
};

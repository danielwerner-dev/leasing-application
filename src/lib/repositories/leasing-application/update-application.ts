import logger from '$lib/utils/logger';
import { ConflictError, NotFoundError } from '$lib/types/errors';
import {
  Application,
  ApplicationStatus,
  IntegrationData,
  Property,
  SubmissionStatus
} from '$lib/types/Application.types';
import type { FormData } from '$lib/types/form-data/types';
import { getApplication } from '$lib/repositories/leasing-application/read-application';
import { DBClient } from '$lib/repositories/leasing-application/dynamo-client';
import { ExternalFields, TransactionType } from '$lib/types/repository.types';
import { parseToDB } from '$lib/parsers/repositories/integration-data.parser';
import { logError } from '$lib/utils/errors';
import { QueryCommandOutput } from '@aws-sdk/lib-dynamodb';
import {
  yardiOwnedTransactionItem,
  paidByIdTransactionItem
} from '$lib/repositories/leasing-application/transaction-items';
import { TransactWriteItem } from '@aws-sdk/client-dynamodb';

export const updateFormData = async (
  applicationId: string,
  formData: FormData,
  ipAddress: string
) => {
  const now = new Date().toISOString();
  const application = await getApplication(applicationId);

  if (!application) {
    throw new NotFoundError('Application not found');
  }

  if (application.applicationStatus === ApplicationStatus.deleted) {
    throw new ConflictError(
      `Cannot update application with status ${application.applicationStatus}`
    );
  }

  Object.keys(formData).forEach((key) => {
    formData[key].audit = {
      updatedAt: now,
      updatedByIp: ipAddress
    };
  });

  const { formData: currentFormData = {} } = application;
  application.formData = {
    ...currentFormData,
    ...formData
  };

  const expression =
    'SET formData = :formData, audit.updatedAt = :now, audit.updatedByIp = :ip';
  const attributes = {
    ':formData': application.formData,
    ':now': now,
    ':ip': ipAddress
  };

  await DBClient.update(applicationId, expression, attributes);
  return application;
};

export const updateApplicationExistingCustomer = async (
  applicationId: string,
  customerId: string,
  email: string
) => {
  const now = new Date().toISOString();
  const expression =
    'SET customerId = :customerId, email = :email, audit.updatedAt = :now';
  const attributes = {
    ':customerId': customerId,
    ':email': email,
    ':now': now
  };
  await DBClient.update(applicationId, expression, attributes);
};

export const updateApplicationNewCustomer = async (
  applicationId: string,
  email: string
) => {
  await updateApplicationExistingCustomer(applicationId, 'coapplicant', email);
};

export const updateIntegrationData = async (
  applicationId: string,
  integrationData: IntegrationData
) => {
  const now = new Date().toISOString();
  const guestCardId = integrationData?.yardi?.guestcardId;
  const applicantId = integrationData?.yardi?.applicantId;

  const expression =
    'SET guestcardId = :guestcardId, applicantId = :applicantId, integrationData = :integrationData, audit.updatedAt = :now';
  const attributes = {
    ':integrationData': parseToDB(integrationData),
    ':now': now,
    ':guestcardId': guestCardId,
    ':applicantId': applicantId
  };

  await DBClient.update(applicationId, expression, attributes);
};

export const updateCompletedApplication = async (
  applicationId: string,
  {
    amountPaid,
    paymentMethod
  }: {
    amountPaid: number;
    paymentMethod: string;
  }
): Promise<Application> => {
  const expression =
    'SET applicationStatus = :pendingStatus, ' +
    'yardiOwned = :yardiOwned, ' +
    'submission.amountPaid = :amountPaid, ' +
    'submission.paymentMethod = :paymentMethod, ' +
    'audit.submissionStatus = :statusSuccess';

  const attributes = {
    ':pendingStatus': ApplicationStatus.pending,
    ':yardiOwned': true,
    ':amountPaid': amountPaid,
    ':paymentMethod': paymentMethod,
    ':statusSuccess': SubmissionStatus.SUCCESS
  };

  await DBClient.update(applicationId, expression, attributes);

  const updatedApplication = await getApplication(applicationId);

  if (!updatedApplication) {
    throw new NotFoundError('Error loading updated application');
  }

  return updatedApplication;
};

export const updatePaidByIdTransaction = async (
  applications: Application[],
  paidById: string,
  transactionType: TransactionType
) => {
  logger.info(`Updating paidById for ${applications?.length} applications`);
  const now = new Date().toISOString();

  if (applications.length) {
    const transactionItems = applications.map((application) => {
      return paidByIdTransactionItem(
        application,
        transactionType,
        now,
        paidById
      );
    });

    try {
      await DBClient.executeTransaction(transactionItems);
    } catch (err) {
      logError('update-application.updatePaidByIdTransaction', err);
      throw new ConflictError('One or more applications could not be paid for');
    }
  }
};

export const updateApplicationYardiOwned = async (
  guestcardId: string,
  yardiOwned: boolean
) => {
  const queryResults: QueryCommandOutput = await DBClient.query({
    TableName: 'leasing-applications',
    IndexName: 'YardiGuestcardIndex',
    KeyConditionExpression: 'guestcardId = :guestcardId',
    ExpressionAttributeValues: {
      ':guestcardId': guestcardId
    }
  });
  const { Items: applications = [] } = queryResults;

  const transactionsItems = applications.map(({ PK }) => {
    return yardiOwnedTransactionItem(PK, yardiOwned);
  });

  await DBClient.executeTransaction(transactionsItems);
};

export const updatePromotedApplication = async (
  transactionsItems: TransactWriteItem[]
) => {
  await DBClient.executeTransaction(transactionsItems);
};

export const updateApplicationStatus = async (
  applicationId: string,
  applicationStatus: ApplicationStatus
) => {
  const expression = 'SET applicationStatus = :applicationStatus';
  const attributes = {
    ':applicationStatus': applicationStatus
  };

  await DBClient.update(applicationId, expression, attributes);
};

export const updateApplicationProperty = async (
  applicationId: string,
  property: Property
) => {
  const expression = 'SET #property = :property';
  const attributes = { ':property': property };
  const attributeNames = { '#property': 'property' };

  await DBClient.update(applicationId, expression, attributes, {
    attributeNames
  });
};

export const updateApplicationSubmissionStatus = async (
  application: Application,
  status: SubmissionStatus
) => {
  const expression = 'SET audit.submissionStatus = :status';
  const attributes = {
    ':status': status
  };

  await DBClient.update(application.applicationId, expression, attributes);
};

export const updateApplicationStartSubmission = async (
  application: Application,
  ipAddress: string
) => {
  const now = new Date().toISOString();

  const expression =
    'SET audit.submissionStatus = :status, ' +
    'audit.submittedAt = :now, ' +
    'audit.submittedByIp = :ipAddress';
  const attributes = {
    ':status': SubmissionStatus.IN_PROGRESS,
    ':now': now,
    ':ipAddress': ipAddress
  };

  await DBClient.update(application.applicationId, expression, attributes);
};

export const updateApplicationExternalFields = async (
  applicationId: string,
  { property, yardi }: ExternalFields
) => {
  const now = new Date().toISOString();

  const expression =
    'SET #property = :property, ' +
    'integrationData.yardi = :yardi, ' +
    'audit.updatedAt = :now';

  const attributes = {
    ':property': property,
    ':yardi': yardi,
    ':now': now
  };

  const attributeNames = {
    '#property': 'property'
  };

  await DBClient.update(applicationId, expression, attributes, {
    attributeNames
  });
};

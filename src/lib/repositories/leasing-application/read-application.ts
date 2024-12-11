import { QueryCommandInput } from '@aws-sdk/lib-dynamodb';

import {
  Application,
  ApplicationStatus,
  DynamoDBApplication
} from '$lib/types/Application.types';
import { DBClient } from '$lib/repositories/leasing-application/dynamo-client';
import { ConflictError } from '$lib/types/errors';

interface ListCoapplicantsOptions {
  includePrimary?: boolean;
}

export const parseApplication = (
  rawApplication: DynamoDBApplication
): Application => {
  return {
    applicationId: rawApplication.PK,
    applicationType: rawApplication.applicationType,
    applicationStatus: rawApplication.applicationStatus,
    applicationVersion: rawApplication.applicationVersion,
    customer: {
      customerId: rawApplication.customerId,
      email: rawApplication.email
    },
    primaryApplicationId: rawApplication.primaryApplicationId,
    primaryApplicationData: rawApplication?.primaryApplicationData,
    paidById: rawApplication.paidById,
    property: rawApplication.property,
    submission: rawApplication.submission,
    formData: rawApplication.formData,
    integrationData: {
      ...rawApplication.integrationData,
      yardi: {
        ...rawApplication.integrationData?.yardi,
        guestcardId: rawApplication?.guestcardId || '',
        applicantId: rawApplication?.applicantId || ''
      }
    },
    promoted: Boolean(rawApplication.promoted),
    yardiOwned: rawApplication.yardiOwned,
    audit: rawApplication.audit
  };
};

export const getApplication = async (
  applicationId: string
): Promise<Application | null> => {
  const res = await DBClient.get(applicationId);

  if (!res.Item) {
    return null;
  }

  return parseApplication(res.Item as DynamoDBApplication);
};

export const getApplicationByApplicantId = async (
  applicantId: string
): Promise<Application | null> => {
  const input: QueryCommandInput = {
    TableName: 'leasing-applications',
    IndexName: 'YardiApplicantIndex',
    KeyConditionExpression: 'applicantId = :applicantId',
    ExpressionAttributeValues: {
      ':applicantId': applicantId
    }
  };

  const response = await DBClient.query(input);

  if (!response || !Array.isArray(response.Items) || !response.Items.length) {
    return null;
  }

  if (response.Items.length > 1) {
    const ids = response.Items.map((item) => item.PK);
    throw new ConflictError(
      `There is more than 1 application for the applicant id ${applicantId}: ${ids.join(
        ', '
      )}`
    );
  }

  const [application] = response.Items as DynamoDBApplication[];

  return parseApplication(application);
};

export const listCoapplicantApplications = async (
  primaryApplicationId: string,
  options: ListCoapplicantsOptions = {}
): Promise<Application[]> => {
  const parameters: QueryCommandInput = {
    TableName: 'leasing-applications',
    IndexName: 'PrimaryApplicationIndex',
    KeyConditionExpression: 'primaryApplicationId = :applicationId',
    ExpressionAttributeValues: {
      ':applicationId': `${primaryApplicationId}`
    }
  };

  const response = await DBClient.query(parameters);
  if (!response || !Array.isArray(response.Items)) {
    return [];
  }

  const applications = response.Items as DynamoDBApplication[];

  const parsedApplications = applications.map(parseApplication);

  if (options.includePrimary) {
    return parsedApplications;
  }

  return parsedApplications.filter(
    ({ applicationId }) => applicationId !== primaryApplicationId
  );
};

export const listApplicationByCustomer = async (
  customerId: string
): Promise<Application[]> => {
  const input: QueryCommandInput = {
    TableName: 'leasing-applications',
    IndexName: 'CustomerIndex',
    KeyConditionExpression: 'customerId = :customerId',
    FilterExpression: 'applicationStatus <> :deleted',
    ExpressionAttributeValues: {
      ':customerId': customerId,
      ':deleted': ApplicationStatus.deleted
    }
  };

  const response = await DBClient.query(input);

  if (!response || !Array.isArray(response.Items)) {
    return [];
  }

  const applications = response.Items as DynamoDBApplication[];
  return applications.map(parseApplication);
};

export const listApplicationByEmail = async (
  email: string
): Promise<Application[]> => {
  const input: QueryCommandInput = {
    TableName: 'leasing-applications',
    IndexName: 'EmailIndex',
    KeyConditionExpression: 'email = :email',
    ExpressionAttributeValues: {
      ':email': email
    }
  };

  const response = await DBClient.query(input);

  if (!response || !Array.isArray(response.Items)) {
    return [];
  }

  const applications = response.Items as DynamoDBApplication[];

  return applications.map(parseApplication);
};

export const listApplicationsByGuestcard = async (guestcardId: string) => {
  const input: QueryCommandInput = {
    TableName: 'leasing-applications',
    IndexName: 'YardiGuestcardIndex',
    KeyConditionExpression: 'guestcardId = :guestcardId',
    ExpressionAttributeValues: {
      ':guestcardId': guestcardId
    }
  };

  const response = await DBClient.query(input);

  if (!response || !Array.isArray(response.Items)) {
    return [];
  }

  const applications = response.Items as DynamoDBApplication[];

  return applications.map(parseApplication);
};

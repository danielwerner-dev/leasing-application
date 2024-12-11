import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { AuthContext } from '$lib/types/authorizer.types';
import {
  Application,
  ApplicationStatus,
  ApplicationType,
  DynamoDBApplication
} from '$lib/types/Application.types';

export function eventFixture(event: Partial<APIGatewayProxyEventV2> = {}) {
  const fixture: APIGatewayProxyEventV2 = {
    version: '',
    routeKey: '',
    rawPath: '',
    rawQueryString: '',
    cookies: undefined,
    headers: {
      'client-ip-address': '127.0.0.1'
    },
    queryStringParameters: undefined,
    requestContext: {
      accountId: '',
      apiId: '',
      domainName: '',
      domainPrefix: '',
      http: {
        method: '',
        path: '',
        protocol: '',
        sourceIp: '',
        userAgent: ''
      },
      requestId: '',
      routeKey: '',
      stage: '',
      time: '',
      timeEpoch: 0
    },
    body: undefined,
    pathParameters: undefined,
    isBase64Encoded: false,
    stageVariables: undefined
  };

  return { ...fixture, ...event };
}

export function authContextFixture(): AuthContext {
  return new AuthContext('5fff81eb-69f1-47f2-a002-4eac57cc0379', '');
}

export const applicationFixture = (): Application => {
  return {
    primaryApplicationData: {
      leaseTerm: '12',
      leaseStartDate: '2022-09-14',
      applicationType: 'primary',
      firstName: 'John',
      lastName: 'Snow'
    },
    paidById: '',
    applicationId: '0cdef30d-a2a6-4702-80af-4fd303630416',
    applicationType: ApplicationType.primary,
    primaryApplicationId: '0cdef30d-a2a6-4702-80af-4fd303630416',
    applicationStatus: ApplicationStatus.draft,
    applicationVersion: 'v1',
    customer: {
      customerId: '15959714-8f6d-4088-b84c-1e2ab7fe02be',
      email: 'a@a.com'
    },
    property: {
      puCode: '23142-23142',
      propertyCode: '23142',
      unitCode: '23142',
      slug: '123-garden-ave',
      propertyUrl: 'https://property-listing.devinvh.com/123-garden-ave',
      city: 'City name',
      state: 'NC',
      zipcode: '11111',
      address1: '123 Garden Avenue',
      market: {
        slug: 'sacramento-ca'
      },
      beds: 2,
      baths: '2',
      sqft: 1000,
      marketRent: '1000',
      availableAt: '09/14/2021',
      unitStatus: 'available',
      isSyndicated: false
    },
    submission: {
      amountPaid: 50,
      paymentMethod: 'ACH'
    },
    formData: formDataFixture(),
    integrationData: integrationDataFixture(),
    promoted: false,
    yardiOwned: undefined,
    audit: {
      createdAt: '2022-09-13T00:00:00.000Z',
      createdByIp: '254.254.254.254',
      updatedAt: new Date().toISOString(),
      updatedByIp: '254.254.254.254',
      submittedAt: new Date().toISOString(),
      submittedByIp: '254.254.254.254'
    }
  };
};

export const formDataFixture: () => any = () => {
  return {
    general: {
      firstName: 'First',
      lastName: 'Last',
      email: 'a@a.com',
      phone: {
        digits: '1234567890',
        type: 'cell'
      },
      audit: {
        updatedAt: '2023-02-02T20:33:11.986Z',
        updatedByIp: '127.127.127.127'
      },
      methodOfContact: 'landline',
      maritalStatus: 'single',
      middleName: '',
      title: '',
      applicationType: 'personal',
      leaseTerm: '12',
      leaseStartDate: '09/14/2022',
      leaseEndDate: '09/14/2023',
      metadata: {
        config: {
          isCalifornia: false
        }
      }
    },
    personalDetails: {
      dateOfBirth: '01/01/1990',
      driversLicense: {
        number: '123456789',
        state: 'NC'
      },
      idDocument: {
        type: 'ein',
        number: '123456789'
      },
      emergencyContact: {
        name: 'Emergency Contact',
        relationship: 'Other',
        phone: {
          digits: '1234567890',
          type: 'cell'
        }
      },
      audit: {
        updatedAt: '2023-02-02T20:33:11.986Z',
        updatedByIp: '127.127.127.127'
      },
      vehicles: [],
      animals: [],
      dependents: [],
      reviewedProvidedInfo: true,
      metadata: {
        config: {
          isSouthFlorida: false
        }
      },
      backgroundInfo: false,
      acceptedTerms: true
    },
    residence: {
      currentResidence: {
        type: 'current',
        id: '123',
        isInternational: false,
        addressLine1: '123 Garden Avenue',
        addressLine2: '',
        city: 'City name',
        state: 'NC',
        zipcode: '11111',
        startDate: '2021-09-14'
      },
      pastResidences: [],
      audit: {
        updatedAt: '2023-02-02T20:33:11.986Z',
        updatedByIp: '127.127.127.127'
      }
    },
    employment: {
      employmentStatus: 'employed',
      employment: {
        employer: 'Employer',
        phone: '1234567890',
        isInternational: false,
        addressLine1: '123 Garden Avenue',
        addressLine2: '',
        city: 'City name',
        state: 'NC',
        zipcode: '11111',
        jobTitle: 'Job Title'
      },
      audit: {
        updatedAt: '2023-02-02T20:33:11.986Z',
        updatedByIp: '127.127.127.127'
      },
      monthlyGrossIncome: '1000',
      additionalIncome: [],
      activeMilitary: false,
      metadata: {
        config: {
          isCalifornia: false
        }
      }
    },
    documents: {
      noIncome: true,
      audit: {
        updatedAt: '2023-02-02T20:33:11.986Z',
        updatedByIp: '127.127.127.127'
      }
    },
    coapplicants: {
      coapplicants: [],
      audit: {
        updatedAt: '2023-02-02T20:33:11.986Z',
        updatedByIp: '127.127.127.127'
      },
      confirmedApplicationInfo: true
    }
  };
};

export const integrationDataFixture: () => any = () => {
  return {
    yardi: {
      guestcardId: 'p151515',
      applicantId: 'p151515',
      paymentInfo: {
        payerId: '1234',
        paymentType: 'CREDIT',
        description: 'description'
      }
    }
  };
};

export const successAPIGatewayFixture = () => {
  return {
    statusCode: 200,
    body: '',
    headers: { 'content-type': 'application/json' }
  };
};

export const dynamoDBApplicationFixture = (): DynamoDBApplication => {
  const application = applicationFixture();
  return {
    PK: application.applicationId,
    applicationType: application.applicationType,
    applicationStatus: application.applicationStatus,
    applicationVersion: application.applicationVersion,
    customerId: application.customer.customerId,
    email: application.customer.email,
    primaryApplicationId: application.primaryApplicationId,
    primaryApplicationData: application.primaryApplicationData,
    paidById: application.paidById,
    property: application.property,
    submission: application.submission,
    formData: application.formData,
    applicantId: application.integrationData?.yardi?.applicantId,
    guestcardId: application.integrationData?.yardi?.guestcardId,
    integrationData: dynamoDBIntegrationDataFixture(),
    audit: application.audit
  };
};

export const dynamoDBIntegrationDataFixture = () => {
  const dynamoDBIntegrationData = integrationDataFixture();
  delete dynamoDBIntegrationData.yardi.guestcardId;
  delete dynamoDBIntegrationData.yardi.applicantId;
  return dynamoDBIntegrationData;
};

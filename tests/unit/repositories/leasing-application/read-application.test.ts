import * as dbClient from '$lib/repositories/leasing-application/dynamo-client';
import * as readApplication from '$lib/repositories/leasing-application/read-application';
import { applicationFixture, dynamoDBApplicationFixture } from '$fixtures';

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

jest.useFakeTimers().setSystemTime(new Date());

describe('read-application', () => {
  let dynamoApplication;
  beforeEach(() => {
    dynamoApplication = dynamoDBApplicationFixture();
  });

  describe('parseApplication', () => {
    it('parses application from Dynamo format to LAS format', () => {
      const expectedApplication = applicationFixture();

      expect(readApplication.parseApplication(dynamoApplication)).toStrictEqual(
        expectedApplication
      );
    });
  });

  describe('getApplication', () => {
    beforeEach(() => {
      jest
        .spyOn(readApplication, 'parseApplication')
        .mockImplementation(jest.fn());
    });

    it('returns `null` when application is not found', async () => {
      jest.spyOn(dbClient.DBClient, 'get').mockResolvedValue({} as any);

      await expect(readApplication.getApplication('1234')).resolves.toEqual(
        null
      );
      expect(dbClient.DBClient.get).toHaveBeenCalledWith('1234');
      expect(readApplication.parseApplication).not.toHaveBeenCalled();
    });

    it('calls parseApplication with raw application', async () => {
      jest
        .spyOn(dbClient.DBClient, 'get')
        .mockResolvedValue({ Item: dynamoApplication } as any);
      jest
        .spyOn(readApplication, 'parseApplication')
        .mockImplementation(jest.fn());

      await readApplication.getApplication('1234');
      expect(dbClient.DBClient.get).toHaveBeenCalledWith('1234');
      expect(readApplication.parseApplication).toHaveBeenCalledWith(
        dynamoApplication
      );
    });
  });

  describe('getApplicationByApplicantId', () => {
    let applicantId: any;
    beforeEach(() => {
      applicantId = 'applicant-id';

      jest
        .spyOn(dbClient.DBClient, 'query')
        .mockResolvedValue({ Items: [dynamoApplication] } as any);
      jest
        .spyOn(readApplication, 'parseApplication')
        .mockImplementation(jest.fn());
    });

    it('calls dbClient with the correct input', async () => {
      await readApplication.getApplicationByApplicantId(applicantId);

      const expectedInput = {
        TableName: 'leasing-applications',
        IndexName: 'YardiApplicantIndex',
        KeyConditionExpression: 'applicantId = :applicantId',
        ExpressionAttributeValues: {
          ':applicantId': applicantId
        }
      };

      expect(dbClient.DBClient.query).toHaveBeenCalledWith(expectedInput);
      expect(readApplication.parseApplication).toHaveBeenCalledWith(
        dynamoApplication
      );
    });

    it('returns `null` if nothing is returned from the database', async () => {
      jest
        .spyOn(dbClient.DBClient, 'query')
        .mockResolvedValue(undefined as any);

      const res = await readApplication.getApplicationByApplicantId(
        applicantId
      );

      expect(res).toEqual(null);
    });

    it('returns `null` if database does not return array for Items', async () => {
      jest
        .spyOn(dbClient.DBClient, 'query')
        .mockResolvedValue({ Items: {} } as any);

      const res = await readApplication.getApplicationByApplicantId(
        applicantId
      );

      expect(res).toEqual(null);
    });

    it('returns `null` if Items is empty', async () => {
      jest
        .spyOn(dbClient.DBClient, 'query')
        .mockResolvedValue({ Items: [] } as any);

      const res = await readApplication.getApplicationByApplicantId(
        applicantId
      );

      expect(res).toEqual(null);
    });

    it('throws if database returns more than one application', async () => {
      jest.spyOn(dbClient.DBClient, 'query').mockResolvedValue({
        Items: [dynamoApplication, dynamoApplication]
      } as any);

      const expectedError = `There is more than 1 application for the applicant id ${applicantId}: ${dynamoApplication.PK}, ${dynamoApplication.PK}`;

      await expect(
        readApplication.getApplicationByApplicantId(applicantId)
      ).rejects.toThrowError(expectedError);
    });
  });

  describe('listCoapplicantApplications', () => {
    let primaryApplicationId;
    let primaryApplication;
    let coapplicantApplication1;
    let coapplicantApplication2;
    let linkedApplications;
    beforeEach(() => {
      primaryApplicationId = '1234';
      primaryApplication = dynamoDBApplicationFixture();
      coapplicantApplication1 = dynamoDBApplicationFixture();
      coapplicantApplication2 = dynamoDBApplicationFixture();

      primaryApplication.PK = primaryApplicationId;
      coapplicantApplication1.PK = '1234-1';
      coapplicantApplication2.PK = '1234-2';

      linkedApplications = [
        primaryApplication,
        coapplicantApplication1,
        coapplicantApplication2
      ];

      jest
        .spyOn(readApplication, 'parseApplication')
        .mockReturnValueOnce({ applicationId: primaryApplicationId } as any)
        .mockReturnValueOnce({
          applicationId: coapplicantApplication1.PK
        } as any)
        .mockReturnValueOnce({
          applicationId: coapplicantApplication2.PK
        } as any);
    });

    it('returns empty array when nothing is returned from the database', async () => {
      jest.spyOn(dbClient.DBClient, 'query').mockResolvedValue(null as any);

      const primaryApplicationId = '1234';
      const expectedParameter = {
        TableName: 'leasing-applications',
        IndexName: 'PrimaryApplicationIndex',
        KeyConditionExpression: 'primaryApplicationId = :applicationId',
        ExpressionAttributeValues: {
          ':applicationId': primaryApplicationId
        }
      };

      await expect(
        readApplication.listCoapplicantApplications(primaryApplicationId)
      ).resolves.toEqual([]);
      expect(dbClient.DBClient.query).toHaveBeenCalledWith(expectedParameter);
      expect(readApplication.parseApplication).not.toHaveBeenCalled();
    });

    it('returns an empty array when response.Items is not an array', async () => {
      jest
        .spyOn(dbClient.DBClient, 'query')
        .mockResolvedValue({ Items: { hello: 'world' } } as any);

      const expectedParameter = {
        TableName: 'leasing-applications',
        IndexName: 'PrimaryApplicationIndex',
        KeyConditionExpression: 'primaryApplicationId = :applicationId',
        ExpressionAttributeValues: {
          ':applicationId': primaryApplicationId
        }
      };

      await expect(
        readApplication.listCoapplicantApplications(primaryApplicationId)
      ).resolves.toEqual([]);
      expect(dbClient.DBClient.query).toHaveBeenCalledWith(expectedParameter);
      expect(readApplication.parseApplication).not.toHaveBeenCalled();
    });

    it('returns the list of applications without the primary application', async () => {
      jest
        .spyOn(dbClient.DBClient, 'query')
        .mockResolvedValue({ Items: linkedApplications } as any);

      const expectedParameter = {
        TableName: 'leasing-applications',
        IndexName: 'PrimaryApplicationIndex',
        KeyConditionExpression: 'primaryApplicationId = :applicationId',
        ExpressionAttributeValues: {
          ':applicationId': primaryApplicationId
        }
      };

      const coapplicantsApplication =
        await readApplication.listCoapplicantApplications(primaryApplicationId);

      expect(coapplicantsApplication).toHaveLength(
        linkedApplications.length - 1
      );
      expect(dbClient.DBClient.query).toHaveBeenCalledWith(expectedParameter);
      expect(readApplication.parseApplication).toHaveBeenCalledTimes(
        linkedApplications.length
      );
    });

    it('returns the list of applications with the primary application if includePrimary is true', async () => {
      jest
        .spyOn(dbClient.DBClient, 'query')
        .mockResolvedValue({ Items: linkedApplications } as any);

      const expectedParameter = {
        TableName: 'leasing-applications',
        IndexName: 'PrimaryApplicationIndex',
        KeyConditionExpression: 'primaryApplicationId = :applicationId',
        ExpressionAttributeValues: {
          ':applicationId': primaryApplicationId
        }
      };

      const coapplicantsApplication =
        await readApplication.listCoapplicantApplications(
          primaryApplicationId,
          { includePrimary: true }
        );

      expect(coapplicantsApplication).toHaveLength(linkedApplications.length);
      expect(dbClient.DBClient.query).toHaveBeenCalledWith(expectedParameter);
      expect(readApplication.parseApplication).toHaveBeenCalledTimes(
        linkedApplications.length
      );
    });

    it("returns an empty array when there's no co-applicant", async () => {
      jest
        .spyOn(dbClient.DBClient, 'query')
        .mockResolvedValue({ Items: [] } as any);
      const expectedParameter = {
        TableName: 'leasing-applications',
        IndexName: 'PrimaryApplicationIndex',
        KeyConditionExpression: 'primaryApplicationId = :applicationId',
        ExpressionAttributeValues: {
          ':applicationId': primaryApplicationId
        }
      };

      const coapplicantsApplication =
        await readApplication.listCoapplicantApplications(primaryApplicationId);

      expect(coapplicantsApplication).toEqual([]);
      expect(dbClient.DBClient.query).toHaveBeenCalledWith(expectedParameter);
      expect(readApplication.parseApplication).not.toHaveBeenCalled();
    });
  });

  describe('listApplicationByCustomer', () => {
    let customerId;
    let input;
    beforeEach(() => {
      jest
        .spyOn(readApplication, 'parseApplication')
        .mockImplementation(jest.fn());
      customerId = '1234';
      input = {
        TableName: 'leasing-applications',
        IndexName: 'CustomerIndex',
        KeyConditionExpression: 'customerId = :customerId',
        FilterExpression: 'applicationStatus <> :deleted',
        ExpressionAttributeValues: {
          ':customerId': customerId,
          ':deleted': 'deleted'
        }
      };
    });

    it('returns empty array when nothing is returned from DBClient', async () => {
      jest.spyOn(dbClient.DBClient, 'query').mockResolvedValue(null as any);

      const result = await readApplication.listApplicationByCustomer(
        customerId
      );

      expect(result).toEqual([]);
      expect(dbClient.DBClient.query).toHaveBeenCalledWith(input);
      expect(readApplication.parseApplication).not.toHaveBeenCalled();
    });

    it('returns empty array when response.Items is not an array', async () => {
      jest
        .spyOn(dbClient.DBClient, 'query')
        .mockResolvedValue({ Items: { hello: 'world' } } as any);

      const result = await readApplication.listApplicationByCustomer(
        customerId
      );

      expect(result).toEqual([]);
      expect(dbClient.DBClient.query).toHaveBeenCalledWith(input);
      expect(readApplication.parseApplication).not.toHaveBeenCalled();
    });

    it('calls parseApplication for every application returned', async () => {
      const mockedList = [{}, {}];
      jest
        .spyOn(dbClient.DBClient, 'query')
        .mockResolvedValue({ Items: mockedList } as any);

      const results = await readApplication.listApplicationByCustomer(
        customerId
      );

      expect(results).toHaveLength(mockedList.length);
      expect(dbClient.DBClient.query).toHaveBeenCalledWith(input);
      expect(readApplication.parseApplication).toHaveBeenCalledTimes(
        mockedList.length
      );
    });
  });

  describe('parseApplication', () => {
    it('handles applications that have Yardi integration data', async () => {
      const dbApplication = dynamoDBApplicationFixture();
      dbApplication.applicantId = '1234';
      dbApplication.guestcardId = '5678';

      const results = await readApplication.parseApplication(dbApplication);

      expect(results.integrationData.yardi?.applicantId).toBe('1234');
      expect(results.integrationData.yardi?.guestcardId).toBe('5678');
    });
    it('handles applications that have not been submitted to Yardi', async () => {
      const dbApplication = dynamoDBApplicationFixture();
      dbApplication.applicantId = undefined;
      dbApplication.guestcardId = undefined;

      const results = await readApplication.parseApplication(dbApplication);

      expect(results.integrationData.yardi?.applicantId).toBe('');
      expect(results.integrationData.yardi?.guestcardId).toBe('');
    });
  });

  describe('listApplicationByEmail', () => {
    let email;
    let input;
    beforeEach(() => {
      jest
        .spyOn(readApplication, 'parseApplication')
        .mockImplementation(jest.fn());
      email = 'a@a.com';
      input = {
        TableName: 'leasing-applications',
        IndexName: 'EmailIndex',
        KeyConditionExpression: 'email = :email',
        ExpressionAttributeValues: {
          ':email': email
        }
      };
    });

    it('returns empty array when nothing is returned from DBClient', async () => {
      jest.spyOn(dbClient.DBClient, 'query').mockResolvedValue(null as any);

      const result = await readApplication.listApplicationByEmail(email);

      expect(result).toEqual([]);
      expect(dbClient.DBClient.query).toHaveBeenCalledWith(input);
      expect(readApplication.parseApplication).not.toHaveBeenCalled();
    });

    it('returns empty array when response.Items is not an array', async () => {
      jest
        .spyOn(dbClient.DBClient, 'query')
        .mockResolvedValue({ Items: { hello: 'world' } } as any);

      const result = await readApplication.listApplicationByEmail(email);

      expect(result).toEqual([]);
      expect(dbClient.DBClient.query).toHaveBeenCalledWith(input);
      expect(readApplication.parseApplication).not.toHaveBeenCalled();
    });
    it('calls parseApplication for every application returned', async () => {
      const mockedList = [{}, {}];
      jest
        .spyOn(dbClient.DBClient, 'query')
        .mockResolvedValue({ Items: mockedList } as any);

      const results = await readApplication.listApplicationByEmail(email);

      expect(results).toHaveLength(mockedList.length);
      expect(dbClient.DBClient.query).toHaveBeenCalledWith(input);
      expect(readApplication.parseApplication).toHaveBeenCalledTimes(
        mockedList.length
      );
    });
  });

  describe('listApplicationsByGuestcard', () => {
    let guestcardId: any;
    beforeEach(() => {
      guestcardId = 'guestcard-id';

      jest
        .spyOn(dbClient.DBClient, 'query')
        .mockResolvedValue({ Items: [1, 2, 3] } as any);
      jest
        .spyOn(readApplication, 'parseApplication')
        .mockReturnValue('' as any);
    });

    it('calls DBClient with correct expression', async () => {
      await readApplication.listApplicationsByGuestcard(guestcardId);

      const input = {
        TableName: 'leasing-applications',
        IndexName: 'YardiGuestcardIndex',
        KeyConditionExpression: 'guestcardId = :guestcardId',
        ExpressionAttributeValues: {
          ':guestcardId': guestcardId
        }
      };

      expect(readApplication.parseApplication).toHaveBeenCalled();
      expect(dbClient.DBClient.query).toHaveBeenCalledWith(input);
    });

    it('returns empty array if no response comes from dbClient', async () => {
      jest.spyOn(dbClient.DBClient, 'query').mockResolvedValue(null as any);

      const res = await readApplication.listApplicationsByGuestcard(
        guestcardId
      );

      expect(res).toEqual([]);
    });
  });
});

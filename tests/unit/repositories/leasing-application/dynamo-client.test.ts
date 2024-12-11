import * as dbClient from '$lib/repositories/leasing-application/dynamo-client';
import * as libDynamoDb from '@aws-sdk/lib-dynamodb';
import * as clientDynamoDb from '@aws-sdk/client-dynamodb';
import { TransactWriteItemsCommand } from '@aws-sdk/client-dynamodb';

jest.mock('@aws-sdk/client-dynamodb', () => {
  return {
    DynamoDBClient: jest.fn(),
    TransactWriteItemsCommand: jest.fn()
  };
});

jest.mock('@aws-sdk/lib-dynamodb', () => {
  return {
    DynamoDBDocumentClient: {
      from: () => {
        return {
          send: jest.fn()
        };
      }
    },
    GetCommand: jest.fn(),
    GetCommandInput: jest.fn(),
    PutCommand: jest.fn(),
    QueryCommand: jest.fn(),
    QueryCommandInput: jest.fn(),
    QueryCommandOutput: jest.fn(),
    UpdateCommand: jest.fn(),
    UpdateCommandInput: jest.fn()
  };
});

jest.mock('$lib/utils/db', () => {
  return {
    transactionUpdateItem: jest.fn()
  };
});

describe('dynamo-client', () => {
  let partitionKey;
  beforeEach(() => {
    jest.spyOn(dbClient.client, 'send');

    partitionKey = 'test';
  });

  describe('update', () => {
    let expectedParameters;
    let attributes;
    let expression;
    beforeEach(() => {
      jest.spyOn(libDynamoDb, 'UpdateCommand');

      attributes = {
        ':hello': 'world'
      };
      expression = 'hello = :hello';
      expectedParameters = {
        TableName: 'leasing-applications',
        Key: {
          PK: partitionKey
        },
        UpdateExpression: expression,
        ExpressionAttributeValues: {
          ...attributes
        }
      };
    });

    it('calls client.send and UpdateCommand with correct arguments', async () => {
      await dbClient.update(partitionKey, expression, attributes);

      expect(dbClient.client.send).toHaveBeenCalled();
      expect(libDynamoDb.UpdateCommand).toHaveBeenCalledWith(
        expectedParameters
      );
    });

    it('calls client.send and UpdateCommand when we have options', async () => {
      const options = {
        attributeNames: { hello: 'world' },
        returnValues: 'world',
        conditionExpression: 'cond1 = :cond1',
        expressionAttributesValues: {
          ':cond1': ''
        }
      };
      expectedParameters.ExpressionAttributeNames = options.attributeNames;
      expectedParameters.ReturnValues = options.returnValues;
      expectedParameters.ConditionExpression = options.conditionExpression;

      await dbClient.update(partitionKey, expression, attributes, options);

      expect(dbClient.client.send).toHaveBeenCalled();
      expect(libDynamoDb.UpdateCommand).toHaveBeenCalledWith(
        expectedParameters
      );
    });
  });

  describe('get', () => {
    let expectedParameters;
    beforeEach(() => {
      jest.spyOn(libDynamoDb, 'GetCommand');

      expectedParameters = {
        TableName: 'leasing-applications',
        Key: {
          PK: partitionKey
        }
      };
    });

    it('calls client.send and GetCommand with the correct parameters', async () => {
      await dbClient.get(partitionKey);

      expect(dbClient.client.send).toHaveBeenCalled();
      expect(libDynamoDb.GetCommand).toHaveBeenCalledWith(expectedParameters);
    });

    it('calls client.send and GetCommand correctly when attributesToGet is passed', async () => {
      const attributesToGet = ['hello', 'world'];
      expectedParameters.AttributesToGet = attributesToGet;

      await dbClient.get(partitionKey, attributesToGet);

      expect(dbClient.client.send).toHaveBeenCalled();
      expect(libDynamoDb.GetCommand).toHaveBeenCalledWith(expectedParameters);
    });
  });

  describe('set', () => {
    let item;
    let expectedParameters;
    beforeEach(() => {
      jest.spyOn(libDynamoDb, 'PutCommand');

      item = {
        hello: 'world'
      };
      expectedParameters = {
        TableName: 'leasing-applications',
        Item: item
      };
    });

    it('calls client.send and PutCommand with the correct arguments', async () => {
      await dbClient.set(item);

      expect(dbClient.client.send).toHaveBeenCalled();
      expect(libDynamoDb.PutCommand).toHaveBeenLastCalledWith(
        expectedParameters
      );
    });
  });

  describe('query', () => {
    let parameters;
    beforeEach(() => {
      jest.spyOn(libDynamoDb, 'QueryCommand');

      parameters = {
        hello: 'world'
      };
    });

    it('calls client.sent and QueryCommand with the correct arguments', async () => {
      await dbClient.query(parameters);

      expect(dbClient.client.send).toHaveBeenCalled();
      expect(libDynamoDb.QueryCommand).toHaveBeenCalledWith(parameters);
    });
  });

  describe('transactions', () => {
    it('sends transaction commands', async () => {
      const mockCommand = {} as unknown as TransactWriteItemsCommand;
      jest
        .spyOn(clientDynamoDb, 'TransactWriteItemsCommand')
        .mockReturnValue(mockCommand);

      const item = {
        Update: {
          TableName: 'leasing-applications',
          Key: {
            PK: { S: 'partitionKey' }
          },
          UpdateExpression: 'update-Expression',
          ExpressionAttributeValues: {
            ':hello': { S: 'world' }
          },
          ConditionExpression: 'conditionExpression'
        }
      };

      await dbClient.executeTransaction([item]);

      expect(dbClient.client.send).toHaveBeenCalled();
    });
  });
});

import { UpdateOptions } from '$lib/types/repository.types';
import {
  DynamoDBClient,
  TransactWriteItem,
  TransactWriteItemsCommand,
  TransactWriteItemsCommandInput
} from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  GetCommandInput,
  PutCommand,
  QueryCommand,
  QueryCommandInput,
  QueryCommandOutput,
  UpdateCommand,
  UpdateCommandInput
} from '@aws-sdk/lib-dynamodb';

export const TABLE_NAME = 'leasing-applications';

const config = {
  region: 'us-east-1'
};

export const client = DynamoDBDocumentClient.from(new DynamoDBClient(config));

export const update = async (
  partitionKey: string,
  expression: string,
  attributes: Record<string, unknown>,
  options: UpdateOptions | null = null
) => {
  const config: UpdateCommandInput = {
    TableName: TABLE_NAME,
    Key: { PK: partitionKey },
    UpdateExpression: expression,
    ExpressionAttributeValues: {
      ...attributes
    }
  };

  if (options?.attributeNames) {
    config.ExpressionAttributeNames = options.attributeNames;
  }

  if (options?.returnValues) {
    config.ReturnValues = options.returnValues;
  }

  if (options?.conditionExpression) {
    config.ConditionExpression = options.conditionExpression;
  }

  const command = new UpdateCommand(config);

  await client.send(command);
};

export const get = async (
  partitionKey: string,
  attributesToGet: string[] = []
) => {
  const config: GetCommandInput = {
    TableName: TABLE_NAME,
    Key: {
      PK: partitionKey
    }
  };

  if (Array.isArray(attributesToGet) && attributesToGet.length) {
    config.AttributesToGet = attributesToGet;
  }

  const command = new GetCommand(config);

  return await client.send(command);
};

export const set = async (Item: Record<string, unknown>) => {
  const command = new PutCommand({
    TableName: TABLE_NAME,
    Item
  });

  await client.send(command);
};

export const query = async (
  parameters: QueryCommandInput
): Promise<QueryCommandOutput> => {
  const command = new QueryCommand(parameters);

  const res = await client.send(command);

  return res;
};

export const executeTransaction = async (
  transactionItems: TransactWriteItem[]
) => {
  const writeCommandInput: TransactWriteItemsCommandInput = {
    TransactItems: transactionItems
  };

  const commands = new TransactWriteItemsCommand(writeCommandInput);

  return await client.send(commands);
};

export const DBClient = {
  update,
  set,
  get,
  query,
  executeTransaction
};

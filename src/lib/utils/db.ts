import { TABLE_NAME } from '$lib/repositories/leasing-application/dynamo-client';
import { UpdateOptions } from '$lib/types/repository.types';
import {
  AttributeValue,
  TransactWriteItem,
  Update
} from '@aws-sdk/client-dynamodb';

export const transactionUpdateItem = (
  partitionKey: string,
  expression: string,
  attributes: Record<string, AttributeValue>,
  options: UpdateOptions | null = null
): TransactWriteItem => {
  const update: Update = {
    TableName: TABLE_NAME,
    UpdateExpression: expression,
    Key: {
      PK: { S: partitionKey }
    },
    ExpressionAttributeValues: attributes
  };

  if (options?.conditionExpression) {
    update.ConditionExpression = options.conditionExpression;
  }

  return {
    Update: update
  };
};

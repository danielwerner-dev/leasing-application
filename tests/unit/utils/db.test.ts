import { transactionUpdateItem } from '$lib/utils/db';

describe('Db Utils', () => {
  it('builds a transaction item with condition', () => {
    const res = transactionUpdateItem(
      'partitionKey',
      'update-Expression',
      {
        ':hello': { S: 'world' }
      },
      { conditionExpression: 'conditionExpression' }
    );

    expect(res).toEqual({
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
    });
  });

  it('builds a transaction item without conditions', () => {
    const res = transactionUpdateItem('partitionKey', 'update-Expression', {
      ':hello': { S: 'world' }
    });

    expect(res).toEqual({
      Update: {
        TableName: 'leasing-applications',
        Key: {
          PK: { S: 'partitionKey' }
        },
        UpdateExpression: 'update-Expression',
        ExpressionAttributeValues: {
          ':hello': { S: 'world' }
        }
      }
    });
  });
});

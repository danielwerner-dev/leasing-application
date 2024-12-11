import { invokeLambda } from '$lib/connectors/lambda';
import * as lambda from '@aws-sdk/client-lambda';

jest.mock('@aws-sdk/client-lambda');

describe('LambdaConnector', () => {
  it('should invoke lambda with correct params', async () => {
    const command: any = jest.fn();
    await invokeLambda(command);

    expect(lambda.LambdaClient).toHaveBeenCalled();
  });
});

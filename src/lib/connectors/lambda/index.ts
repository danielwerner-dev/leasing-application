import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda';

export const invokeLambda = async (command: InvokeCommand) => {
  const lambdaClient = new LambdaClient({
    region: 'us-east-1'
  });

  return lambdaClient.send(command);
};

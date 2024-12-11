## Required env vars

```shell
# required to run the function
export AWS_ACCESS_KEY_ID= # get from aws
export AWS_SECRET_ACCESS_KEY= # get from aws
export CUSTOMER_SERVICE_URL='https://api-qa.invitationhomes.com/customer/v1'
export YARDI_SERVICE_URL='https://yardi-api.qainvh.com/v1'

export TEST_APPLICATION_ID='your application id'
export TEST_AUTHORIZATION='your token id'
 export ENVIRONMENT='dev' 
```

## tests.ts

Build and execute:

```shell
node_modules/.bin/esbuild --bundle --outfile=dist/tests.cjs --platform=node ./src/functions/PostBankPaymentInfo/tests.ts
node dist/tests.cjs
# or
node_modules/.bin/esbuild --bundle --outfile=dist/tests.cjs --platform=node ./src/functions/PostBankPaymentInfo/tests.ts && node dist/tests.cjs
```

```ts
// tests.ts
import { eventFixture } from '../../tests/fixtures/index';
import { handler } from './index';

const application_id = process.env.TEST_APPLICATION_ID;
const authorization = `Bearer ${process.env.TEST_AUTHORIZATION}`;
const body = JSON.stringify({
  accountNumber: '123456789',
  routingNumber: '123456789'
  nameOnAccount: 'Billy Idol',
  accountType: 'checking'
});

const event = eventFixture({
  isBase64Encoded: true,
  pathParameters: { application_id },
  headers: { authorization },
  body
});

(async () => {
  const result = await handler(event);
  console.log(result);
})();
```

# GetCustomerSummaries Lambda function
The GetCustomerSummaries endpoint is used to get applications from a customer

## What is this document
This Readme will give you the steps needed to run the get customer summaries handler locally.
This allows you to develop significantly faster compared to deploying to the cloud for every test.

## Overview of steps needed to start

1. Setup application with correct data
2. Setup environment variables
3. copy tests.ts code into a local tests.ts file
4. Build tests.ts
5. Execute tests.cjs

### Setup environment variables
Replace values where needed and copy into shell and execute

## Required env vars

```shell
# required to run the function
export AWS_ACCESS_KEY_ID= # get from aws
export AWS_SECRET_ACCESS_KEY= # get from aws
export TEST_CUSTOMER_ID='' # your customer id
export TEST_AUTHORIZATION='' # your id Token
# settings for qa below
export PLS_URL='https://property-listing.qainvh.com'
export LEASING_APPLICATION_BASE_URL='https://www.qainvh.com'
export CUSTOMER_SERVICE_URL='https://api-qa.invitationhomes.com/customer/v1'
export YARDI_SERVICE_URL='https://yardi-api.qainvh.com/v1'
```

## tests.ts

Build and execute:

```shell
node_modules/.bin/esbuild --bundle --outfile=dist/tests.cjs --platform=node ./src/functions/GetCustomerSummaries/tests.ts
node dist/tests.cjs
# or
node_modules/.bin/esbuild --bundle --outfile=dist/tests.cjs --platform=node ./src/functions/GetCustomerSummaries/tests.ts && node dist/tests.cjs
```

```ts
// tests.ts
import { eventFixture } from '../../../tests/fixtures/index';
import { handler } from './index';

const customer_id = process.env.TEST_APPLICATION_ID;
const authorization = `Bearer ${process.env.TEST_AUTHORIZATION}`;

const event = eventFixture({
  pathParameters: { customer_id },
  headers: { authorization }
});

(async () => {
  const result = await handler(event);
  console.log(JSON.parse(result.body));
})();

```

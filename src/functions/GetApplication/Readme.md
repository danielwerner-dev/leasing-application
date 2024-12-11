## Required env vars

```shell
# required to run the function
export AWS_ACCESS_KEY_ID= # get from aws
export AWS_SECRET_ACCESS_KEY= # get from aws
export CUSTOMER_SERVICE_URL='https://api-qa.invitationhomes.com/customer/v1'
export YARDI_SERVICE_URL='https://yardi-api.qainvh.com/v1'
export ENVIRONMENT='qa'
export LEASING_APPLICATION_BASE_URL='https://www.qainvh.com/lease'

```

## tests.ts

Build and execute:

```shell
node_modules/.bin/esbuild --bundle --outfile=dist/tests.cjs --platform=node ./src/functions/GetApplication/tests.ts
node dist/tests.cjs
# or
node_modules/.bin/esbuild --bundle --outfile=dist/tests.cjs --platform=node ./src/functions/GetApplication/tests.ts && node dist/tests.cjs
```

```ts
// tests.ts
import { eventFixture } from '../../tests/fixtures/index';
import { handler } from './index';

const application_id = 'the application id'
const bearerToken = 'your bearer token'
const authorization = `Bearer ${bearerToken}`;

const event = eventFixture({
  isBase64Encoded: true,
  pathParameters: { application_id },
  headers: { authorization },
  body
});

(async () => {
  const result = await handler(event);
    console.log(JSON.parse(result.body));
})();

```
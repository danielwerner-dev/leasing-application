## Required env vars

```shell
# required to run the function
export ENVIRONMENT="dev"
export AWS_ACCESS_KEY_ID= # get from aws
export AWS_SECRET_ACCESS_KEY= # get from aws

export TEST_APPLICATION_ID=''
export TEST_AUTHORIZATION=''

```

## tests.ts

Build and execute:

```shell
node_modules/.bin/esbuild --bundle --outfile=dist/tests.cjs --platform=node ./functions/PostDocument/tests.ts
node dist/tests.cjs
# or
node_modules/.bin/esbuild --bundle --outfile=dist/tests.cjs --platform=node ./functions/PostDocument/tests.ts && node dist/tests.cjs
```

```ts
import { eventFixture } from '../../../tests/fixtures/index';
import { handler } from './index';

const application_id = process.env.TEST_APPLICATION_ID;
const authorization = `Bearer ${process.env.TEST_AUTHORIZATION}`;
const body = JSON.stringify({
  document_type: 'government-issued-id',
  document_display_name: 'myFile.jpg'
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

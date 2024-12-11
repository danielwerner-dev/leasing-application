# Leasing Application Service (LAS)

A BFF (Backend-For-Frontend) API for the Leasing Application Web and App

### Useful Links

Here is some useful information regarding the Leasing Application.

##### Enpoint information

https://lucid.app/lucidchart/845b2383-ff24-4868-825f-b9a15909a4f5/edit?invitationId=inv_debc1a32-1ff3-41f1-8dbb-5db4b8919a3c&page=0_0#

#### Confluence posts

https://invitationhomes.atlassian.net/wiki/spaces/AR/pages/1071415303/Leasing+Application
https://invitationhomes.atlassian.net/wiki/spaces/PROJ/pages/1451065696/Leasing+Application+Integrations
https://invitationhomes.atlassian.net/wiki/spaces/PROJ/pages/1331003439/Leasing+Application+Data+Structure
https://invitationhomes.atlassian.net/wiki/spaces/CPT/pages/1355448351/Regression+Testing-+Leasing+Application
https://invitationhomes.atlassian.net/wiki/spaces/PROJ/pages/1453391927/Leasing+Application+Error+States
https://invitationhomes.atlassian.net/wiki/spaces/AR/pages/1302036753/Yardi-Service+-+Lease+Application+Process

### Setup for Local Development

These instructions assume that you have Git CLI.

_Please [create an issue on GitHub](https://github.com/invitation-homes/leasing-application-service/issues), if you experience issues using the steps below._

```bash
# 1. Clone the repository
git clone git@github.com:invitation-homes/leasing-application-service.git

# 2. Install dependencies
yarn
```

### Environment Variables

1. This is required to get the document list from S3, so pick one (QA or DEV)
   EXPORT ENVIROMENT=dev|qa

2. Go to [AWS SSO](https://d-90677ec96f.awsapps.com/start#/:~:text=Command%20line%20or-,programmatic,-access), copy and paste your credentials and import it in the same terminal that you plan to run the test.
   We need this to run local tests that gets data from DynamoDB
   If the link doesn't work check our wiki on [how to get your AWS env variables](https://github.com/invitation-homes/leasing-application-service/wiki/How-to-get-your-AWS-env-variables).

### Running tests localy

1. Copy tests.example file inside function directory that you need to test. Eg: functions/GetApplication
2. Rename tests.example to tests.ts
3. Fill the informations as needed, with some highlights

   - pathParameters: Here we fill with parameters that are handled in the URL
   - theBody: Here if your function need any information provided body, fill here as many you need

4. Change Bearer Token to a valid one([instructions](https://github.com/invitation-homes/leasing-application-service/wiki/How-to-get-a-valid-bearer-token))
5. Save your changes
6. ##### Build the bundle

   ```shell
   node_modules/.bin/esbuild --bundle --outfile=dist/tests.cjs --platform=node ./functions/path-to-your-function/tests.ts
   ```

7. ##### Run the bundle

   ```shell
   node dist/tests.cjs
   ```

### Example tests.ts file

```typescript
import { eventFixture } from "../../tests/fixtures/index";
import * as getApplicationSummary from "./index";

// General: Ensure that AWS session token is valid and has not expired. In case of error, renew the AWS profile credentials.
const theBody = {};

// Test 001 :
// Happy path. With event including valid customer data
const theEvent = eventFixture({
  isBase64Encoded: true,
  pathParameters: {
    application_id: "{app id here}",
  },
  body: JSON.stringify(theBody),
  headers: {
    authorization: "Bearer {token here}",
  },
});

// Execute
const theResult = getApplicationSummary.handler(theEvent);
theResult.then((result) => {
  console.log(result);
});
```
### Add lambda to routes

Add new entry to api-gateway.tf file 
terraform -> application -> api-gateway.tf

Example route entry
```
# POST /applications/{application_id}/payment-types/bank

module "post_bank_payment_type" {
  source = "./modules/api-gateway-lambda-function"

  function_description = "Save bank payment for an application"
  function_name        = "PostBankPaymentInfo" 
  method               = "POST"
  path                 = "applications/{application_id}/payment-types/bank"
  shared_config        = local.shared_api_config
}
```

### Removed from api routes

Removed PostBankPaymentInfo from api-gateway.tf 

CDEC-2768

https://invitationhomes.atlassian.net/jira/software/c/projects/CDEC/boards/248?modal=detail&selectedIssue=CDEC-2768&assignee=62fa65c79c368329a7aef10e

```
# POST /applications/{application_id}/payment-types/bank

module "post_bank_payment_type" {
  source = "./modules/api-gateway-lambda-function"

  function_description = "Save bank payment for an application"
  function_name        = "PostBankPaymentInfo" 
  method               = "POST"
  path                 = "applications/{application_id}/payment-types/bank"
  shared_config        = local.shared_api_config
}
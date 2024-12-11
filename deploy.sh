#!/usr/bin/env bash

set -e

FUNCTION_NAME=$1

yarn esbuild --bundle --outfile=dist/index.js --platform=node ./functions/${FUNCTION_NAME}

# Copy assets folder to dist
[[ -e ./functions/${FUNCTION_NAME}/assets ]] && cp -r ./functions/${FUNCTION_NAME}/assets ./dist/assets

cd dist && zip -r -q ${FUNCTION_NAME}.zip index.js assets && cd -

aws lambda update-function-code \
    --function LeasingApplicationService_${FUNCTION_NAME} \
    --zip-file fileb://./dist/${FUNCTION_NAME}.zip \
    | jq

echo "Updating Lambda function's code..."

aws lambda wait function-updated \
    --function LeasingApplicationService_${FUNCTION_NAME} \
    | jq

echo "Successfully updated Lambda function code"
echo "Tailing log file..."

aws logs tail /aws/lambda/LeasingApplicationService_${FUNCTION_NAME} --follow --since 10m

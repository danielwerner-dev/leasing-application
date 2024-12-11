#!/usr/bin/env bash

# What is this document?
# This outlines the steps to upload a Lambda function's code to aws.
# This OVERRIDES the code that is loaded in that environment.
# This is useful to automate the delpoyment of a single 
# function while developing/troubleshooting. 

# Prerequisites
# * This assumes that the aws cli is installed and configured
# * This assumes that env variables are copied into env variables
# export AWS_ACCESS_KEY_ID="{id}"
# export AWS_SECRET_ACCESS_KEY="{key}"
# export AWS_SESSION_TOKEN="{token}"

# AWS profile names
set -e

# Derive the name of the function from its directory
function=$(basename "$PWD")

# Build the function and create a zip file
yarn build
cd dist && zip ${function}.zip index.js && cd -

# Deploy the code and wait for the update to complete
aws lambda update-function-code \
    --function LeasingApplicationService_${function} \
    --zip-file fileb://./dist/${function}.zip \
    --profile dev-admin | jq

aws lambda wait function-updated \
    --function LeasingApplicationService_${function} \
    --profile dev-admin | jq

#!/usr/bin/env bash

# What is this document?

# This outlines the steps to tail the logs of a Lambda function in aws.

# Prerequisites
# * This assumes that the aws cli is installed and configured
# * This assumes that env variables are copied into env variables
# export AWS_ACCESS_KEY_ID="{id}"
# export AWS_SECRET_ACCESS_KEY="{key}"
# export AWS_SESSION_TOKEN="{token}"

# Derive the name of the function from its directory
function=$(basename "$PWD")

aws logs tail /aws/lambda/LeasingApplicationService_${function} \
    --follow \
    --since 10m \
    --profile dev-admin

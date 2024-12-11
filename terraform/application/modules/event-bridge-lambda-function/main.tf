data "aws_caller_identity" "current" {}

locals {
  account_id   = data.aws_caller_identity.current.account_id
  package_json = jsondecode(file("../../package.json"))
  version      = local.package_json.version
}

resource "aws_cloudwatch_log_group" "lambda_log_group" {
  name              = "/aws/lambda/LeasingApplicationService_${var.name}"
  retention_in_days = 14
}

resource "aws_lambda_function" "eventbridge_rule_function" {
  s3_bucket     = "lambda-functions-${var.lambda_environment.ENVIRONMENT}-invh"
  s3_key        = "LeasingApplicationService/${var.name}/${var.name}-${local.version}.zip"
  function_name = "LeasingApplicationService_${var.name}"
  description   = var.description
  role          = var.role_arn

  handler     = "/opt/nodejs/node_modules/datadog-lambda-js/handler.handler"
  memory_size = 1024
  timeout     = 180

  runtime = "nodejs18.x"

  tracing_config {
    mode = "Active"
  }

  environment {
    variables = merge(var.lambda_environment, {
      VERSION    = local.version,
      DD_VERSION = local.version,
    })
  }

  layers = [
    "arn:aws:lambda:us-east-1:464622532012:layer:Datadog-Extension:36",
    "arn:aws:lambda:us-east-1:464622532012:layer:Datadog-Node18-x:86"
  ]

  tags = {
    "Name"    = "LeasingApplicationService_${var.name}"
    "Version" = local.version
  }
}

resource "aws_cloudwatch_log_subscription_filter" "datadog_log_forwarder" {
  name            = "datadog-log-forwarder"
  log_group_name  = aws_cloudwatch_log_group.lambda_log_group.name
  destination_arn = "arn:aws:lambda:us-east-1:${local.account_id}:function:Datadog_Forwarder"
  filter_pattern  = ""
}

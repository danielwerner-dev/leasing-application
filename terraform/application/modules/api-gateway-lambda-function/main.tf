data "aws_caller_identity" "current" {}

locals {
  account_id   = data.aws_caller_identity.current.account_id
  package_json = jsondecode(file("../../package.json"))
  version      = local.package_json.version
  dd_layers = [
    "arn:aws:lambda:us-east-1:464622532012:layer:Datadog-Extension:36",
    "arn:aws:lambda:us-east-1:464622532012:layer:Datadog-Node18-x:86"
  ]
}

resource "aws_cloudwatch_log_group" "lambda_log_group" {
  name              = "/aws/lambda/LeasingApplicationService_${var.function_name}"
  retention_in_days = 14
}

data "aws_lambda_layer_version" "layer_html_pdf" {
  layer_name = "HtmlToPdf"
}

resource "aws_lambda_function" "api_function" {
  s3_bucket     = "lambda-functions-${var.shared_config.lambda_environment.ENVIRONMENT}-invh"
  s3_key        = "LeasingApplicationService/${var.function_name}/${var.function_name}-${local.version}.zip"
  function_name = "LeasingApplicationService_${var.function_name}"
  description   = var.function_description
  role          = var.shared_config.function_role_arn

  handler     = "/opt/nodejs/node_modules/datadog-lambda-js/handler.handler"
  memory_size = 1024
  timeout     = 30

  runtime = "nodejs18.x"

  tracing_config {
    mode = "Active"
  }

  environment {
    variables = merge(var.shared_config.lambda_environment, {
      VERSION    = local.version,
      DD_VERSION = local.version,
    })
  }

  layers = var.use_layer ? concat(["${data.aws_lambda_layer_version.layer_html_pdf.arn}"], local.dd_layers) : local.dd_layers

  tags = {
    "Name"    = "LeasingApplicationService_${var.function_name}"
    "Version" = "${local.version}"
  }
}

resource "aws_apigatewayv2_integration" "api_integration" {
  api_id             = var.shared_config.api_id
  description        = "Integration defined for leasing applications api"
  credentials_arn    = var.shared_config.api_gateway_role_arn
  integration_type   = "AWS_PROXY"
  integration_uri    = aws_lambda_function.api_function.invoke_arn
  integration_method = "POST"
  connection_type    = "INTERNET"
}

resource "aws_apigatewayv2_route" "api_route" {
  api_id    = var.shared_config.api_id
  route_key = "${var.method} /leasing/v1/${var.path}"
  target    = "integrations/${aws_apigatewayv2_integration.api_integration.id}"

  authorization_type = var.authorization_type
  authorizer_id      = var.shared_config.authorizer_id
}

resource "aws_cloudwatch_log_subscription_filter" "datadog_log-forwarder" {
  name            = "datadog-log-forwarder"
  log_group_name  = aws_cloudwatch_log_group.lambda_log_group.name
  destination_arn = "arn:aws:lambda:us-east-1:${local.account_id}:function:Datadog_Forwarder"
  filter_pattern  = ""
}

variable "authorization_type" {
  type        = string
  description = "The route's authorization type (AWS_IAM or JWT(default))"
  default     = "JWT"
}

variable "function_description" {
  type        = string
  description = "The Lambda function description"
}

variable "function_name" {
  type        = string
  description = "The Lambda function name"
}

variable "method" {
  type        = string
  description = "The route method (e.g. GET, POST)"
}

variable "path" {
  type        = string
  description = "The route path after /leasing/v1 that will be integrated with the Lambda function"
  default     = null
}

variable "use_layer" {
  type        = bool
  description = "Indicates if the lambda function uses a lambda layer or not"
  default     = false
}

variable "shared_config" {
  type = object({
    api_id               = string
    api_gateway_role_arn = string
    authorizer_id        = string
    function_role_arn    = string
    lambda_environment = object({
      ENVIRONMENT                  = string
      LEASING_APPLICATION_BASE_URL = string
      YARDI_SERVICE_URL            = string
      CUSTOMER_SERVICE_URL         = string
      EMAIL_DELIVERY_SERVICE_URL   = string
      PLS_URL                      = string
      DD_TRACE_ENABLED             = string
      DD_API_KEY                   = string
      DD_SERVICE                   = string
      DD_ENV                       = string
      DD_SITE                      = string
      DD_LAMBDA_HANDLER            = string
      DD_CAPTURE_LAMBDA_PAYLOAD    = string
      DD_MERGE_XRAY_TRACES         = string
      DD_FLUSH_TO_LOG              = string
    })
  })
  description = "Configuration shared across all Lambda functions"
}

variable "description" {
  type        = string
  description = "The description of the Lambda function"
}

variable "name" {
  type        = string
  description = "The name of the Lambda function"
}

variable "role_arn" {
  type        = string
  description = "The ARN of the Lambda function's role"
}

variable "lambda_environment" {
  type = object({
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
  description = "Environment Variables to be use by Lambda functions"
}

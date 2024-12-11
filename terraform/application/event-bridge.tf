# ProcessCustomerVerified

module "process_customer_verified" {
  source = "./modules/event-bridge-lambda-function"

  name        = "ProcessCustomerVerified"
  description = "Process the info provided in the event data when a customer verifies a just signed up account"

  lambda_environment = local.lambda_environment
  role_arn           = aws_iam_role.lambda_functions.arn
}



resource "aws_cloudwatch_event_rule" "get_event_customer_verified" {
  name           = "LeasingApplicationService-Get-Event-CustomerVerified"
  description    = "Get info from the event when a customer verifies a just signed up account"
  event_bus_name = "invitation-homes"
  is_enabled     = true

  event_pattern = jsonencode(
    {
      "detail-type" : [
        "CustomerVerified"
      ],
      "source" : [
        "customer-service"
      ]
    }
  )
}

resource "aws_cloudwatch_event_target" "event_customer_verified_lambda_target" {
  rule           = aws_cloudwatch_event_rule.get_event_customer_verified.name
  target_id      = "process-event-customer-verified"
  event_bus_name = "invitation-homes"
  arn            = module.process_customer_verified.function_arn
}

resource "aws_lambda_permission" "allow_cloudwatch_eventbridge_to_process_event_customer_verified" {
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = module.process_customer_verified.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.get_event_customer_verified.arn
}

# PrimaryApplicantRemoved

module "process_primary_applicant_removed" {
  source = "./modules/event-bridge-lambda-function"

  name        = "PrimaryApplicantRemoved"
  description = "Remove the primary application and promote a co-applicant as primary"

  lambda_environment = local.lambda_environment
  role_arn           = aws_iam_role.lambda_functions.arn
}

resource "aws_cloudwatch_event_rule" "get_event_primary_applicant_removed" {
  name           = "LeasingApplicationService-Get-Event-PrimaryApplicantRemoved"
  description    = "Get info from the event when a primary application is removed and a co-applicant promoted"
  event_bus_name = "invitation-homes"
  is_enabled     = true

  event_pattern = jsonencode({
    "detail-type" : ["PrimaryApplicantRemoved"],
    "source" : ["yardi-service"]
  })
}

resource "aws_cloudwatch_event_target" "event_primary_applicant_removed_lambda_target" {
  rule           = aws_cloudwatch_event_rule.get_event_primary_applicant_removed.name
  target_id      = "process-event-primary-applicant-removed"
  event_bus_name = "invitation-homes"
  arn            = module.process_primary_applicant_removed.function_arn
}

resource "aws_lambda_permission" "allow_cloudwatch_eventbridge_to_process_event_primary_applicant_removed" {
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = module.process_primary_applicant_removed.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.get_event_primary_applicant_removed.arn
}

# ApplicationStatusChanged

module "process_application_status_changed" {
  source = "./modules/event-bridge-lambda-function"

  name        = "ApplicationStatusChanged"
  description = "Set property yardiOwned to true for application with given guestcard"

  lambda_environment = local.lambda_environment
  role_arn           = aws_iam_role.lambda_functions.arn
}

resource "aws_cloudwatch_event_rule" "get_event_application_status_changed" {
  name           = "LeasingApplicationService-Get-Event-ApplicationStatusChanged"
  description    = "Get info from the event when a application status is changed by Yardi"
  event_bus_name = "invitation-homes"
  is_enabled     = true

  event_pattern = jsonencode({
    "detail-type" : ["ApplicationStatusChanged"],
    "source" : ["yardi-service"]
  })
}

resource "aws_cloudwatch_event_target" "event_application_status_changed_lambda_target" {
  rule           = aws_cloudwatch_event_rule.get_event_application_status_changed.name
  target_id      = "process-event-application-status-changed"
  event_bus_name = "invitation-homes"
  arn            = module.process_application_status_changed.function_arn
}

resource "aws_lambda_permission" "allow_cloudwatch_eventbridge_to_process_event_application_status_changed" {
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = module.process_application_status_changed.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.get_event_application_status_changed.arn
}

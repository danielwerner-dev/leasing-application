# API Gateway data source

data "aws_apigatewayv2_apis" "main" {
  protocol_type = "HTTP"
  name          = "Main API Gateway"
}

# tflint-ignore: terraform_unused_declarations
data "assert_test" "exactly_one_main_api_gateway" {
  test  = length(tolist(data.aws_apigatewayv2_apis.main.ids)) == 1
  throw = "Expected exactly one API Gateway named 'Lease Application Service'"
}

# User pools data source

data "aws_cognito_user_pools" "customers_user_pool" {
  name = "customers"
}

# tflint-ignore: terraform_unused_declarations
data "assert_test" "exactly_one_customers_user_pool" {
  test  = length(tolist(data.aws_cognito_user_pools.customers_user_pool.ids)) == 1
  throw = "Expected exactly one user pool named 'customers'"
}

# User pool clients data source

data "aws_cognito_user_pool_clients" "customers_user_pool_clients" {
  user_pool_id = local.user_pool_id
}

locals {
  api_id       = one(data.aws_apigatewayv2_apis.main.ids)
  user_pool_id = one(data.aws_cognito_user_pools.customers_user_pool.ids)

  shared_api_config = {
    api_id               = local.api_id
    api_gateway_role_arn = aws_iam_role.api_gateway.arn
    authorizer_id        = aws_apigatewayv2_authorizer.leasing_applications_authorizer.id
    function_role_arn    = aws_iam_role.lambda_functions.arn
    user_pool_id         = local.user_pool_id
    lambda_environment   = local.lambda_environment
  }
}

resource "aws_apigatewayv2_authorizer" "leasing_applications_authorizer" {
  api_id           = local.api_id
  authorizer_type  = "JWT"
  identity_sources = ["$request.header.Authorization"]
  name             = "leasing-applications-api-authorizer"

  jwt_configuration {
    audience = data.aws_cognito_user_pool_clients.customers_user_pool_clients.client_ids
    issuer   = "https://cognito-idp.us-east-1.amazonaws.com/${local.user_pool_id}"
  }
}

# GET /applications/{application_id}

module "get_application" {
  source = "./modules/api-gateway-lambda-function"

  function_description = "Gets a leasing application from the database"
  function_name        = "GetApplication"
  method               = "GET"
  path                 = "applications/{application_id}"
  shared_config        = local.shared_api_config
}

# GET /applications/customer/{customer_id}

module "get_customer_summaries" {
  source = "./modules/api-gateway-lambda-function"

  function_description = "Gets a customer leasing application summaries from the database"
  function_name        = "GetCustomerSummaries"
  method               = "GET"
  path                 = "applications/customer/{customer_id}"
  shared_config        = local.shared_api_config
}

# POST /applications

module "post_application" {
  source = "./modules/api-gateway-lambda-function"

  function_description = "Adds a new leasing application into the database"
  function_name        = "PostApplication"
  method               = "POST"
  path                 = "applications"
  shared_config        = local.shared_api_config
}

# PATCH /applications/{application_id}

module "patch_form_data" {
  source = "./modules/api-gateway-lambda-function"

  function_description = "Updates an existing leasing application into the database"
  function_name        = "PatchFormData"
  method               = "PATCH"
  path                 = "applications/{application_id}"
  shared_config        = local.shared_api_config
}

# PATCH /applications/{application_id}/delete

module "delete_application" {
  source = "./modules/api-gateway-lambda-function"

  function_description = "Soft delete an existing leasing application"
  function_name        = "DeleteApplication"
  method               = "PATCH"
  path                 = "applications/{application_id}/delete"
  shared_config        = local.shared_api_config
}

# PATCH /applications/{application_id}/complete

module "complete_application" {
  source = "./modules/api-gateway-lambda-function"

  function_description = "Set an application as completed based on application_id"
  function_name        = "PatchCompleteApplication"
  method               = "PATCH"
  path                 = "applications/{application_id}/complete"
  use_layer            = true
  shared_config        = local.shared_api_config
}

# POST /applications/{application_id}/documents

module "post_document" {
  source = "./modules/api-gateway-lambda-function"

  function_description = "Generates urls to allow a client to upload a document"
  function_name        = "PostDocument"
  method               = "POST"
  path                 = "applications/{application_id}/documents"
  shared_config        = local.shared_api_config
}

# GET /applications/{application_id}/documents/{document_id}

module "get_document" {
  source = "./modules/api-gateway-lambda-function"

  function_description = "Generates urls to allow a client to download a document"
  function_name        = "GetDocument"
  method               = "GET"
  path                 = "applications/{application_id}/documents/{document_id}"
  shared_config        = local.shared_api_config
}

# GET /applications/{application_id}/documents

module "get_documents_list" {
  source = "./modules/api-gateway-lambda-function"

  function_description = "Gets the list of documents uploaded for a leasing application"
  function_name        = "GetDocumentsList"
  method               = "GET"
  path                 = "applications/{application_id}/documents"
  shared_config        = local.shared_api_config
}

# DELETE /applications/{application_id}/documents/{document_id}

module "delete_document" {
  source = "./modules/api-gateway-lambda-function"

  function_description = "Delete one document based on application_id and document_id"
  function_name        = "DeleteDocument"
  method               = "DELETE"
  path                 = "applications/{application_id}/documents/{document_id}"
  shared_config        = local.shared_api_config
}

# GET /applications/{application_id}/summary

module "get_application_summary" {
  source = "./modules/api-gateway-lambda-function"

  function_description = "Gets the summary information for an application"
  function_name        = "GetApplicationSummary"
  method               = "GET"
  path                 = "applications/{application_id}/summary"
  use_layer            = true
  shared_config        = local.shared_api_config
}

# PUT /applications/{application_id}/coapplicant

module "put_coapplicant" {
  source = "./modules/api-gateway-lambda-function"

  function_description = "Puts a new applicant into primary leasing application"
  function_name        = "PutAddCoapplicant"
  method               = "PUT"
  path                 = "applications/{application_id}/coapplicant"
  shared_config        = local.shared_api_config
}

# GET /applications/primary-application/{application_id}/payment-summary

module "get_payment_summary" {
  source = "./modules/api-gateway-lambda-function"

  function_description = "Gets the payment summary for all applicants of primary application"
  function_name        = "GetPaymentSummary"
  method               = "GET"
  path                 = "applications/primary-application/{application_id}/payment-summary"
  shared_config        = local.shared_api_config
}

# POST /applications/{application_id}/invite

module "post_invite_applicant" {
  source = "./modules/api-gateway-lambda-function"

  function_description = "Send invite to applicant of given application_id"
  function_name        = "PostInviteApplicant"
  method               = "POST"
  path                 = "applications/{application_id}/invite"
  shared_config        = local.shared_api_config
}

# PATCH /applications/{application_id}/email
module "patch_coapplicant_email" {

  source = "./modules/api-gateway-lambda-function"

  function_description = "Edit email of given coapplicant application id in a given application"
  function_name        = "PatchCoapplicantCustomer"
  method               = "PATCH"
  path                 = "applications/{application_id}/email"
  shared_config        = local.shared_api_config
}

# GET /applications/{application_id}/payment-types/card/form

module "get_card_payment_form" {
  source = "./modules/api-gateway-lambda-function"

  function_description = "Get form to save a payment card for an application"
  function_name        = "GetCardPaymentForm"
  method               = "GET"
  path                 = "applications/{application_id}/payment-types/card/form"
  shared_config        = local.shared_api_config
}

# GET /applications/{application_id}/linked-applications

module "get_linked_applications" {
  source = "./modules/api-gateway-lambda-function"

  function_description = "Gets all applications linked to a Primary Application"
  function_name        = "GetLinkedApplications"
  method               = "GET"
  path                 = "applications/{application_id}/linked-applications"
  shared_config        = local.shared_api_config
}

# DELETE /applications/{application_id}/payment-type
module "delete_payment_type" {
  source = "./modules/api-gateway-lambda-function"

  function_description = "Delete payment based on payment_type, payer_id, applicant_id, guestcard_id"
  function_name        = "DeletePaymentType"
  method               = "DELETE"
  path                 = "applications/{application_id}/payment-type"
  shared_config        = local.shared_api_config
}

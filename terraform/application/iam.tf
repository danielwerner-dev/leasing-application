#################################
# Lambda function role and policy
#################################

resource "aws_iam_role" "lambda_functions" {
  name        = "leasing-application-service-lambda-functions"
  description = "IAM role assumed by Lambda functions"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_functions_cloudwatch" {
  role       = aws_iam_role.lambda_functions.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

data "aws_dynamodb_table" "leasing_applications" {
  name = "leasing-applications"
}

# tfsec:ignore:aws-iam-no-policy-wildcards
resource "aws_iam_role_policy" "lambda_functions_dynamodb" {
  name = "parameter-dynamodb"
  role = aws_iam_role.lambda_functions.name

  policy = jsonencode({
    "Version" : "2012-10-17"
    "Statement" : [
      {
        "Effect" : "Allow"
        "Action" : [
          "dynamodb:BatchGetItem",
          "dynamodb:BatchWriteItem",
          "dynamodb:ConditionCheckItem",
          "dynamodb:DeleteItem",
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:Query",
          "dynamodb:Scan",
          "dynamodb:UpdateItem"
        ]
        "Resource" : [
          data.aws_dynamodb_table.leasing_applications.arn,
          "${data.aws_dynamodb_table.leasing_applications.arn}/index/*"
        ]
      }
    ]
  })
}

data "aws_s3_bucket" "leasing_application_documents" {
  bucket = "leasing-application-documents-${var.aws_account}-invh"
}

# tfsec:ignore:aws-iam-no-policy-wildcards
resource "aws_iam_role_policy" "lambda_functions_s3" {
  name = "lambda-functions-role-s3"
  role = aws_iam_role.lambda_functions.name

  policy = jsonencode({
    "Version" : "2012-10-17"
    "Statement" : [
      {
        "Effect" : "Allow"
        "Action" : [
          "s3:ListBucket"
        ]
        "Resource" : [
          data.aws_s3_bucket.leasing_application_documents.arn
        ]
      },
      {
        "Effect" : "Allow"
        "Action" : [
          "s3:GetObject",
          "s3:GetObjectAcl",
          "s3:GetObjectAttributes",
          "s3:GetObjectTagging",
          "s3:PutObject",
          "s3:PutObjectAcl",
          "s3:PutObjectTagging",
          "s3:DeleteObject",
          "s3:DeleteObjectTagging"
        ]
        "Resource" : [
          data.aws_s3_bucket.leasing_application_documents.arn,
          "${data.aws_s3_bucket.leasing_application_documents.arn}/*"
        ]
      }
    ]
  })
}

data "aws_lambda_layer_version" "layer_html_pdf" {
  layer_name = "HtmlToPdf"
}

resource "aws_iam_role_policy" "lambda_functions_layer" {
  name = "lambda-functions-role-layer"
  role = aws_iam_role.lambda_functions.name

  policy = jsonencode({
    "Version" : "2012-10-17"
    "Statement" : [
      {
        "Effect" : "Allow"
        "Action" : [
          "lambda:GetLayerVersion"
        ]
        "Resource" : [
          data.aws_lambda_layer_version.layer_html_pdf.arn
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy" "lambda_functions_invoke_application_summary" {
  name = "lambda-functions-role-invoke-application-summary"
  role = aws_iam_role.lambda_functions.name

  policy = jsonencode({
    "Version" : "2012-10-17"
    "Statement" : [
      {
        "Effect" : "Allow"
        "Action" : [
          "lambda:InvokeFunction",
        ]
        "Resource" : [
          "arn:aws:lambda:us-east-1:${local.account_id}:function:LeasingApplicationService_GetApplicationSummary"
        ]
      }
    ]
  })
}

#############################
# Email Delivery Service Access
#############################
data "aws_iam_policy" "email_delivery_service_sendemail_service_existing_iam_policy" {
  name = "EmailDeliveryService_SendEmail"
}

resource "aws_iam_role_policy_attachment" "email_delivery_service_sendemail_service_attachment" {
  role       = aws_iam_role.lambda_functions.name
  policy_arn = data.aws_iam_policy.email_delivery_service_sendemail_service_existing_iam_policy.arn
}

#############################
# Yardi Service Access
#############################
data "aws_iam_policy" "yardi_service_existing_iam_policy" {
  name = "YardiService_ManageApplications"
}

resource "aws_iam_role_policy_attachment" "yardi_service_attachment" {
  role       = aws_iam_role.lambda_functions.name
  policy_arn = data.aws_iam_policy.yardi_service_existing_iam_policy.arn
}

#############################
# Customer Service Access
#############################
data "aws_iam_policy" "customer_service_existing_iam_policy" {
  name = "CustomerService_AdminSearchCustomers"
}

resource "aws_iam_role_policy_attachment" "customer_service_attachment" {
  role       = aws_iam_role.lambda_functions.name
  policy_arn = data.aws_iam_policy.customer_service_existing_iam_policy.arn
}

#############################
# API Gateway role and policy
#############################

resource "aws_iam_role" "api_gateway" {
  name        = "leasing-application-service-api-gateway"
  description = "Role used by Leasing Application Service integrations on our main API gateway"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "apigateway.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    "Name" = "leasing-application-service-api-gateway-role"
  }
}

resource "aws_iam_role_policy" "api_gateway_lambda" {
  name = "lambda"
  role = aws_iam_role.api_gateway.name

  policy = jsonencode({
    "Version" : "2012-10-17"
    "Statement" : [
      {
        "Effect" : "Allow"
        "Action" : [
          "lambda:InvokeFunction"
        ]
        "Resource" : [
          module.get_application.function_arn,
          module.get_customer_summaries.function_arn,
          module.post_application.function_arn,
          module.patch_form_data.function_arn,
          module.delete_application.function_arn,
          module.complete_application.function_arn,
          module.post_document.function_arn,
          module.get_document.function_arn,
          module.get_documents_list.function_arn,
          module.delete_document.function_arn,
          module.get_application_summary.function_arn,
          module.put_coapplicant.function_arn,
          module.post_invite_applicant.function_arn,
          module.get_payment_summary.function_arn,
          module.patch_coapplicant_email.function_arn,
          module.get_card_payment_form.function_arn,
          module.get_linked_applications.function_arn,
          module.delete_payment_type.function_arn,
        ]
      }
    ]
  })
}


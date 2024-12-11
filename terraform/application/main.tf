terraform {
  required_version = "~> 1.3.0"

  backend "remote" {
    hostname     = "app.terraform.io"
    organization = "invitation-homes"

    workspaces {
      prefix = "leasing-application-service-application-"
    }
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.53.0"
    }

    assert = {
      source  = "bwoznicki/assert"
      version = "~> 0.0.1"
    }

    vault = {
      source  = "hashicorp/vault"
      version = "~> 3.11"
    }
  }
}

provider "vault" {
  address = "https://vault-cluster-private-vault-654f10ba.a80e29bb.z1.hashicorp.cloud:8200"
  auth_login {
    namespace = "admin"
    path      = "auth/aws-shared-services/login"
    method    = "aws"
    parameters = {
      role = "terraform-cloud-agent-standard-role"
    }
  }
}

data "vault_aws_access_credentials" "creds" {
  namespace = "admin"
  backend   = "aws-${var.aws_account}"
  role      = "admin-access"
}

provider "aws" {
  region = "us-east-1"

  access_key = data.vault_aws_access_credentials.creds.access_key
  secret_key = data.vault_aws_access_credentials.creds.secret_key

  default_tags {
    tags = {
      Environment = var.aws_account
      Component   = "leasing-application-service"
      Owner       = "customer-profile"
    }
  }
}

provider "assert" {}

data "aws_caller_identity" "current" {}

locals {
  account_id = data.aws_caller_identity.current.account_id
  lambda_environment = {
    ENVIRONMENT                  = var.aws_account
    LEASING_APPLICATION_BASE_URL = var.aws_account == "production" ? "https://www.invitationhomes.com/lease" : "https://www.${var.aws_account}invh.com/lease"
    YARDI_SERVICE_URL            = var.aws_account == "production" ? "https://yardi-api.invitationhomes.com/v1" : "https://yardi-api.${var.aws_account}invh.com/v1",
    CUSTOMER_SERVICE_URL         = var.aws_account == "production" ? "https://api.invitationhomes.com/customer/v1" : "https://api-${var.aws_account}.invitationhomes.com/customer/v1",
    EMAIL_DELIVERY_SERVICE_URL   = var.aws_account == "production" ? "https://email-delivery-api.invitationhomes.com/v1" : "https://email-delivery-api.${var.aws_account}invh.com/v1"
    PLS_URL                      = var.aws_account == "production" ? "https://lease.invitationhomes.com" : "https://property-listing.${var.aws_account}invh.com"
    DD_TRACE_ENABLED             = "true",
    DD_API_KEY                   = var.dd_api_key,
    DD_SERVICE                   = "leasing-application-service",
    DD_ENV                       = var.aws_account,
    DD_SITE                      = "datadoghq.com",
    DD_LAMBDA_HANDLER            = "index.handler",
    DD_CAPTURE_LAMBDA_PAYLOAD    = "false",
    DD_MERGE_XRAY_TRACES         = "false",
    DD_FLUSH_TO_LOG              = "true"
  }
}

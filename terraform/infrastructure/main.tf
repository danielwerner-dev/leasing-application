terraform {
  required_version = "~> 1.3.0"

  backend "remote" {
    hostname     = "app.terraform.io"
    organization = "invitation-homes"

    workspaces {
      prefix = "leasing-application-service-infrastructure-"
    }
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.53.0"
    }

    random = {
      source  = "hashicorp/random"
      version = "~> 3.1.0"
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

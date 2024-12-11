resource "aws_s3_bucket" "leasing_application_docs" {
  bucket = "leasing-application-documents-${var.aws_account}-invh"

  tags = {
    "Name"        = "leasing-application-documents-s3-bucket"
    "Description" = "S3 bucket to store the support documents for leasing applications"
  }
}

resource "aws_s3_bucket_acl" "leasing_application_docs" {
  bucket = aws_s3_bucket.leasing_application_docs.id
  acl    = "private"
}

resource "aws_s3_bucket_versioning" "leasing_application_docs" {
  bucket = aws_s3_bucket.leasing_application_docs.id
  versioning_configuration {
    status = "Enabled"
  }
}

# tfsec:ignore:aws-s3-encryption-customer-key
resource "aws_s3_bucket_server_side_encryption_configuration" "leasing_application_docs" {
  bucket = aws_s3_bucket.leasing_application_docs.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# tfsec:ignore:aws-s3-block-public-acls tfsec:ignore:aws-s3-block-public-policy tfsec:ignore:aws-s3-ignore-public-acls tfsec:ignore:aws-s3-no-public-buckets
resource "aws_s3_bucket_public_access_block" "leasing_application_docs" {
  bucket = aws_s3_bucket.leasing_application_docs.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_logging" "leasing_application_docs" {
  bucket = aws_s3_bucket.leasing_application_docs.id

  target_bucket = "s3-logs-${var.aws_account}-invh"
  target_prefix = "leasing-application-documents-${var.aws_account}-invh/"
}

resource "aws_s3_bucket_cors_configuration" "leasing_application_docs" {
  bucket = aws_s3_bucket.leasing_application_docs.bucket

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT"]
    allowed_origins = var.aws_account == "production" ? ["*.invitationhomes.com"] : ["*.${var.aws_account}invh.com:3000", "*.${var.aws_account}invh.com"]
    expose_headers  = ["x-amz-server-side-encryption", "x-amz-request-id", "x-amz-id-2"]
    max_age_seconds = 3000
  }
}

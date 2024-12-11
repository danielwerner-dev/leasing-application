# tfsec:ignore:aws-dynamodb-enable-at-rest-encryption
resource "aws_dynamodb_table" "leasing_applications" {
  name = "leasing-applications"

  # until we know the typical usage, we will use on-demand billing
  billing_mode = "PAY_PER_REQUEST"

  # generic keys for single-table design
  hash_key = "PK"

  # GSI to support secondary access patterns (e.g. leasing application by customer)
  global_secondary_index {
    name            = "CustomerIndex"
    hash_key        = "customerId"
    projection_type = "ALL"
  }

  # GSI to support secondary access patterns (e.g. leasing application by primary application)
  global_secondary_index {
    name            = "PrimaryApplicationIndex"
    hash_key        = "primaryApplicationId"
    projection_type = "ALL"
  }

  # GSI to support secondary access patterns (e.g. leasing application by email)
  global_secondary_index {
    name            = "EmailIndex"
    hash_key        = "email"
    projection_type = "ALL"
  }

  # GSI to support Yardi Interactions (e.g. cancelling applications)
  global_secondary_index {
    name            = "YardiGuestcardIndex"
    hash_key        = "guestcardId"
    projection_type = "ALL"
  }

  # GSI to support Yardi Interactions (e.g. cancelling applications)
  global_secondary_index {
    name            = "YardiApplicantIndex"
    hash_key        = "applicantId"
    projection_type = "ALL"
  }

  attribute {
    name = "PK"
    type = "S"
  }

  attribute {
    name = "customerId"
    type = "S"
  }

  attribute {
    name = "primaryApplicationId"
    type = "S"
  }

  attribute {
    name = "email"
    type = "S"
  }

  attribute {
    name = "guestcardId"
    type = "S"
  }

  attribute {
    name = "applicantId"
    type = "S"
  }

  point_in_time_recovery {
    enabled = true
  }

  tags = {
    "Name" = "leasing-applications-dynamodb-table"
  }
}

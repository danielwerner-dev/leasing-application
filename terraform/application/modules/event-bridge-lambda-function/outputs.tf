output "function_arn" {
  description = "The ARN of the Lambda function"
  value       = aws_lambda_function.eventbridge_rule_function.arn
}

output "function_name" {
  description = "The name of the Lambda function"
  value       = aws_lambda_function.eventbridge_rule_function.function_name
}

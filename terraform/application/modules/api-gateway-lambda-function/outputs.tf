output "function_arn" {
  description = "The ARN of the Lambda function"
  value       = aws_lambda_function.api_function.arn
}

export abstract class CustomError extends Error {
  readonly statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}

export class BadRequestError extends CustomError {
  constructor(message: string) {
    super(message, 400);
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}

export class ForbiddenError extends CustomError {
  constructor(message: string) {
    super(message, 403);
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}
export class NotFoundError extends CustomError {
  constructor(message: string) {
    super(message, 404);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}
export class ConflictError extends CustomError {
  constructor(message: string) {
    super(message, 409);
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}
export class InternalServerError extends CustomError {
  constructor(message: string) {
    super(message, 500);
    Object.setPrototypeOf(this, InternalServerError.prototype);
  }
}

export class AppError extends Error {
  constructor(message, { statusCode = 500, code = 'internal_error', details } = {}) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export function conflictError(message, details) {
  return new AppError(message, {
    statusCode: 409,
    code: 'conflict',
    details
  });
}

export function unauthorizedError(message, details) {
  return new AppError(message, {
    statusCode: 401,
    code: 'unauthorized',
    details
  });
}

export class ApiError extends Error {
  constructor(statusCode, message = 'Something went wrong', options = {}) {
    super(message, options);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.success = false;
  }
}

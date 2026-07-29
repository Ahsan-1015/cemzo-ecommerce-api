class ApiError extends Error {
  /**
   * Custom Operational Error class for API error handling
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Human readable error message
   * @param {Array} errors - Array of specific detailed errors
   * @param {string} stack - Error stack trace
   */
  constructor(statusCode, message = 'Internal Server Error', errors = [], stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  static badRequest(message = 'Bad Request', errors = []) {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message = 'Unauthorized access', errors = []) {
    return new ApiError(401, message, errors);
  }

  static forbidden(message = 'Access forbidden', errors = []) {
    return new ApiError(403, message, errors);
  }

  static notFound(message = 'Resource not found', errors = []) {
    return new ApiError(404, message, errors);
  }

  static conflict(message = 'Resource already exists', errors = []) {
    return new ApiError(409, message, errors);
  }

  static unprocessable(message = 'Validation failed', errors = []) {
    return new ApiError(422, message, errors);
  }

  static internal(message = 'Internal Server Error', errors = []) {
    return new ApiError(500, message, errors);
  }
}

module.exports = ApiError;

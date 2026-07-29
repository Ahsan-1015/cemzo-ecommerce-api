class ApiResponse {
  /**
   * Helper class for constructing standardized API responses
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Response message
   * @param {object|array|null} data - Data payload
   * @param {object|null} pagination - Pagination metadata if applicable
   */
  constructor(statusCode, message = 'Success', data = null, pagination = null) {
    this.statusCode = statusCode;
    this.success = statusCode < 400;
    this.message = message;
    if (data !== null) {
      this.data = data;
    }
    if (pagination) {
      this.pagination = pagination;
    }
  }

  static success(res, statusCode = 200, message = 'Success', data = null, pagination = null) {
    const response = new ApiResponse(statusCode, message, data, pagination);
    const body = {
      success: response.success,
      message: response.message
    };

    if (data !== null) {
      body.data = data;
    }

    if (pagination) {
      body.pagination = pagination;
    }

    return res.status(statusCode).json(body);
  }
}

module.exports = ApiResponse;

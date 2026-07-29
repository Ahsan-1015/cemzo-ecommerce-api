const ApiError = require('../utils/ApiError');

/**
 * Centralized Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = err;

  // Default error properties
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal Server Error';
  let errors = error.errors || [];

  // Mongoose CastError (Invalid ObjectId)
  if (err.name === 'CastError') {
    message = `Resource not found. Invalid ${err.path}: ${err.value}`;
    statusCode = 404;
    errors = [{ field: err.path, message: `Invalid ID format '${err.value}'` }];
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const fields = Object.keys(err.keyValue || {});
    const value = Object.values(err.keyValue || {})[0];
    message = `Duplicate field value entered: '${value}'. Please use another value.`;
    statusCode = 409;
    errors = fields.map((field) => ({
      field,
      message: `${field} '${err.keyValue[field]}' already exists.`
    }));
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    message = 'Database validation failed';
    statusCode = 422;
    errors = Object.values(err.errors).map((val) => ({
      field: val.path,
      message: val.message
    }));
  }

  // JSON Web Token Errors
  if (err.name === 'JsonWebTokenError') {
    message = 'Invalid token. Please log in again.';
    statusCode = 401;
  }
  if (err.name === 'TokenExpiredError') {
    message = 'Your token has expired. Please log in again.';
    statusCode = 401;
  }

  // Log server errors in non-test mode
  if (statusCode === 500 && process.env.NODE_ENV !== 'test') {
    console.error('[SERVER ERROR]', err);
  }

  return res.status(statusCode).json({
    success: false,
    message,
    errors
  });
};

module.exports = errorHandler;

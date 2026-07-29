const ApiError = require('../utils/ApiError');

/**
 * Middleware factory for validating incoming requests using Joi schemas
 * @param {object} schema - Joi schema containing body, query, and/or params
 */
const validate = (schema) => (req, res, next) => {
  const validSchema = ['params', 'query', 'body'];
  const errors = [];

  validSchema.forEach((key) => {
    if (schema[key]) {
      const { error, value } = schema[key].validate(req[key], {
        abortEarly: false,
        stripUnknown: true
      });

      if (error) {
        error.details.forEach((detail) => {
          errors.push({
            field: detail.path.join('.'),
            message: detail.message.replace(/['"]/g, '')
          });
        });
      } else {
        req[key] = value;
      }
    }
  });

  if (errors.length > 0) {
    return next(
      ApiError.unprocessable('Validation failed for request parameters', errors)
    );
  }

  next();
};

module.exports = validate;

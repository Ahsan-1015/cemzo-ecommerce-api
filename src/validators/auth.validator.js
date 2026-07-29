const Joi = require('joi');

const register = {
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(100).messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name cannot exceed 100 characters'
    }),
    email: Joi.string().required().email().messages({
      'string.empty': 'Email is required',
      'string.email': 'Email must be a valid email address'
    }),
    password: Joi.string().required().min(6).messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 6 characters'
    }),
    role: Joi.string().valid('user', 'admin').default('user')
  })
};

const login = {
  body: Joi.object().keys({
    email: Joi.string().required().email().messages({
      'string.empty': 'Email is required',
      'string.email': 'Email must be a valid email address'
    }),
    password: Joi.string().required().messages({
      'string.empty': 'Password is required'
    })
  })
};

module.exports = {
  register,
  login
};

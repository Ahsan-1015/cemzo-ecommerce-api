const Joi = require('joi');

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

const orderItemSchema = Joi.object().keys({
  product: Joi.string().regex(objectIdPattern).required().messages({
    'string.empty': 'Product ID is required',
    'string.pattern.base': 'Invalid Product ID format'
  }),
  quantity: Joi.number().integer().required().min(1).messages({
    'number.base': 'Quantity must be a number',
    'number.min': 'Quantity must be at least 1'
  })
});

const createOrder = {
  body: Joi.object().keys({
    products: Joi.array().items(orderItemSchema).min(1).required().messages({
      'array.min': 'Order must contain at least one product line item',
      'any.required': 'Products list is required'
    })
  })
};

const updateOrderStatus = {
  params: Joi.object().keys({
    id: Joi.string().regex(objectIdPattern).required().messages({
      'string.pattern.base': 'Invalid Order ID format'
    })
  }),
  body: Joi.object().keys({
    status: Joi.string()
      .valid('pending', 'processing', 'completed', 'cancelled')
      .required()
      .messages({
        'any.only': 'Status must be one of: pending, processing, completed, cancelled'
      })
  })
};

const getOrderHistory = {
  query: Joi.object().keys({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10)
  })
};

const orderIdParam = {
  params: Joi.object().keys({
    id: Joi.string().regex(objectIdPattern).required().messages({
      'string.pattern.base': 'Invalid Order ID format'
    })
  })
};

module.exports = {
  createOrder,
  updateOrderStatus,
  getOrderHistory,
  orderIdParam
};

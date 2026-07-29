const Joi = require('joi');

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

const createProduct = {
  body: Joi.object().keys({
    title: Joi.string().required().max(200).messages({
      'string.empty': 'Title is required',
      'string.max': 'Title cannot exceed 200 characters'
    }),
    description: Joi.string().required().messages({
      'string.empty': 'Description is required'
    }),
    category: Joi.string().required().messages({
      'string.empty': 'Category is required'
    }),
    image: Joi.string().required().uri().messages({
      'string.empty': 'Image URL is required',
      'string.uri': 'Image must be a valid URL'
    }),
    sku: Joi.string().required().pattern(/^[A-Za-z0-9_-]+$/).min(3).max(30).uppercase().messages({
      'string.empty': 'SKU is required',
      'string.pattern.base': 'SKU must contain only letters, numbers, hyphens, or underscores'
    }),
    price: Joi.number().required().min(0).messages({
      'number.base': 'Price must be a number',
      'number.min': 'Price must be greater than or equal to 0'
    }),
    stock: Joi.number().integer().required().min(0).messages({
      'number.base': 'Stock must be an integer',
      'number.min': 'Stock cannot be negative'
    }),
    isActive: Joi.boolean().default(true)
  })
};

const updateProduct = {
  params: Joi.object().keys({
    id: Joi.string().regex(objectIdPattern).required().messages({
      'string.pattern.base': 'Invalid Product ID format'
    })
  }),
  body: Joi.object()
    .keys({
      title: Joi.string().max(200),
      description: Joi.string(),
      category: Joi.string(),
      image: Joi.string().uri().messages({
        'string.uri': 'Image must be a valid URL'
      }),
      sku: Joi.string().pattern(/^[A-Za-z0-9_-]+$/).min(3).max(30).uppercase(),
      price: Joi.number().min(0),
      stock: Joi.number().integer().min(0),
      isActive: Joi.boolean()
    })
    .min(1)
    .messages({
      'object.min': 'At least one field must be provided for update'
    })
};

const getProducts = {
  query: Joi.object().keys({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    search: Joi.string().allow(''),
    category: Joi.string().allow(''),
    minPrice: Joi.number().min(0),
    maxPrice: Joi.number().min(0),
    inStock: Joi.boolean(),
    sortBy: Joi.string().valid('createdAt', 'price', 'title', 'stock').default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc')
  })
};

const reserveStock = {
  params: Joi.object().keys({
    id: Joi.string().regex(objectIdPattern).required().messages({
      'string.pattern.base': 'Invalid Product ID format'
    })
  }),
  body: Joi.object().keys({
    quantity: Joi.number().integer().required().min(1).messages({
      'number.base': 'Quantity must be a number',
      'number.min': 'Quantity must be at least 1'
    })
  })
};

const productIdParam = {
  params: Joi.object().keys({
    id: Joi.string().regex(objectIdPattern).required().messages({
      'string.pattern.base': 'Invalid Product ID format'
    })
  })
};

module.exports = {
  createProduct,
  updateProduct,
  getProducts,
  reserveStock,
  productIdParam
};

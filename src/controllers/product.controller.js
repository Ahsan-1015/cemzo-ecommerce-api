const productService = require('../services/product.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Create a new product
 * @route   POST /api/v1/products
 * @access  Private (Admin)
 */
const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body);
  return ApiResponse.success(res, 201, 'Product created successfully', { product });
});

/**
 * @desc    Get all products with pagination, search, sorting & filtering
 * @route   GET /api/v1/products
 * @access  Public
 */
const getProducts = asyncHandler(async (req, res) => {
  const { products, pagination } = await productService.queryProducts(req.query);
  return ApiResponse.success(
    res,
    200,
    'Products retrieved successfully',
    { products },
    pagination
  );
});

/**
 * @desc    Get single product by ID
 * @route   GET /api/v1/products/:id
 * @access  Public
 */
const getProductById = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  return ApiResponse.success(res, 200, 'Product retrieved successfully', { product });
});

/**
 * @desc    Update product details
 * @route   PATCH /api/v1/products/:id
 * @access  Private (Admin)
 */
const updateProduct = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.body);
  return ApiResponse.success(res, 200, 'Product updated successfully', { product });
});

/**
 * @desc    Soft delete a product
 * @route   DELETE /api/v1/products/:id
 * @access  Private (Admin)
 */
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await productService.deleteProduct(req.params.id);
  return ApiResponse.success(res, 200, 'Product deleted successfully', { product });
});

/**
 * @desc    Reserve stock for a product
 * @route   POST /api/v1/products/:id/reserve
 * @access  Private
 */
const reserveStock = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const product = await productService.reserveStock(req.params.id, quantity);
  return ApiResponse.success(
    res,
    200,
    `Successfully reserved ${quantity} unit(s) of stock for product '${product.title}'`,
    { product }
  );
});

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  reserveStock
};

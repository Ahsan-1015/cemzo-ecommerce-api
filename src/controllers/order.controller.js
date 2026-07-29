const orderService = require('../services/order.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Create a new order
 * @route   POST /api/v1/orders
 * @access  Private
 */
const createOrder = asyncHandler(async (req, res) => {
  const items = req.body.products || req.body.items;
  const order = await orderService.createOrder(req.user._id, items);
  return ApiResponse.success(res, 201, 'Order created successfully', { order });
});

/**
 * @desc    Get order history for logged in user
 * @route   GET /api/v1/orders/history
 * @access  Private
 */
const getOrderHistory = asyncHandler(async (req, res) => {
  const { orders, pagination } = await orderService.getUserOrderHistory(
    req.user._id,
    req.query
  );
  return ApiResponse.success(
    res,
    200,
    'Order history retrieved successfully',
    { orders },
    pagination
  );
});

/**
 * @desc    Get order details by ID
 * @route   GET /api/v1/orders/:id
 * @access  Private
 */
const getOrderById = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(
    req.params.id,
    req.user._id,
    req.user.role
  );
  return ApiResponse.success(res, 200, 'Order details retrieved successfully', { order });
});

/**
 * @desc    Update order status
 * @route   PATCH /api/v1/orders/:id/status
 * @access  Private (Admin)
 */
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await orderService.updateOrderStatus(req.params.id, status);
  return ApiResponse.success(
    res,
    200,
    `Order status updated to '${status}' successfully`,
    { order }
  );
});

module.exports = {
  createOrder,
  getOrderHistory,
  getOrderById,
  updateOrderStatus
};

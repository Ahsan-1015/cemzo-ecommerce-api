const express = require('express');
const orderController = require('../../controllers/order.controller');
const validate = require('../../middlewares/validate');
const orderValidator = require('../../validators/order.validator');
const { authenticate, authorize } = require('../../middlewares/auth');

const router = express.Router();

// Protect all order routes
router.use(authenticate);

/**
 * @swagger
 * /api/v1/orders:
 *   post:
 *     summary: Create a new order with stock deduction
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [products]
 *             properties:
 *               products:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [product, quantity]
 *                   properties:
 *                     product:
 *                       type: string
 *                       example: 60d5ecb8b5c9c22b1c8e4111
 *                     quantity:
 *                       type: integer
 *                       example: 2
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Insufficient product stock or validation failure
 */
router
  .route('/')
  .post(validate(orderValidator.createOrder), orderController.createOrder);

/**
 * @swagger
 * /api/v1/orders/history:
 *   get:
 *     summary: Get logged-in user order history
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: User order history list
 */
router.get('/history', validate(orderValidator.getOrderHistory), orderController.getOrderHistory);

/**
 * @swagger
 * /api/v1/orders/{id}:
 *   get:
 *     summary: Get order details by ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order details
 *       404:
 *         description: Order not found
 */
router.get('/:id', validate(orderValidator.orderIdParam), orderController.getOrderById);

/**
 * @swagger
 * /api/v1/orders/{id}/status:
 *   patch:
 *     summary: Update order status (Admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, processing, completed, cancelled]
 *                 example: processing
 *     responses:
 *       200:
 *         description: Order status updated successfully
 */
router.patch(
  '/:id/status',
  authorize('admin'),
  validate(orderValidator.updateOrderStatus),
  orderController.updateOrderStatus
);

module.exports = router;

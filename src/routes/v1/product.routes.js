const express = require('express');
const productController = require('../../controllers/product.controller');
const validate = require('../../middlewares/validate');
const productValidator = require('../../validators/product.validator');
const { authenticate, authorize } = require('../../middlewares/auth');

const router = express.Router();

/**
 * @swagger
 * /api/v1/products:
 *   get:
 *     summary: Get products list with pagination, search, sorting, and filtering
 *     tags: [Products]
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
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search keyword across title, description, category, sku
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: inStock
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, price, title, stock]
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *   post:
 *     summary: Create a new product (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, category, image, sku, price, stock]
 *             properties:
 *               title:
 *                 type: string
 *                 example: Wireless Noise-Canceling Headphones
 *               description:
 *                 type: string
 *                 example: Premium over-ear headphones with active noise cancellation.
 *               category:
 *                 type: string
 *                 example: Electronics
 *               image:
 *                 type: string
 *                 example: https://images.unsplash.com/photo-1505740420928-5e560c06d30e
 *               sku:
 *                 type: string
 *                 example: HEAD-WRLS-001
 *               price:
 *                 type: number
 *                 example: 299.99
 *               stock:
 *                 type: integer
 *                 example: 50
 *               isActive:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Product created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 */
router
  .route('/')
  .get(validate(productValidator.getProducts), productController.getProducts)
  .post(
    authenticate,
    authorize('admin'),
    validate(productValidator.createProduct),
    productController.createProduct
  );

/**
 * @swagger
 * /api/v1/products/{id}:
 *   get:
 *     summary: Get single product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *       404:
 *         description: Product not found
 *   patch:
 *     summary: Update product details (Admin only)
 *     tags: [Products]
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
 *             properties:
 *               title:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Product updated successfully
 *   delete:
 *     summary: Soft delete product (Admin only)
 *     tags: [Products]
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
 *         description: Product soft deleted successfully
 */
router
  .route('/:id')
  .get(validate(productValidator.productIdParam), productController.getProductById)
  .patch(
    authenticate,
    authorize('admin'),
    validate(productValidator.updateProduct),
    productController.updateProduct
  )
  .delete(
    authenticate,
    authorize('admin'),
    validate(productValidator.productIdParam),
    productController.deleteProduct
  );

/**
 * @swagger
 * /api/v1/products/{id}/reserve:
 *   post:
 *     summary: Reserve product stock
 *     tags: [Products]
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
 *             required: [quantity]
 *             properties:
 *               quantity:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Stock reserved successfully
 *       400:
 *         description: Insufficient stock
 */
router.post(
  '/:id/reserve',
  authenticate,
  validate(productValidator.reserveStock),
  productController.reserveStock
);

module.exports = router;

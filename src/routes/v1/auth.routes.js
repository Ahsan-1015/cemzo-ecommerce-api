const express = require('express');
const authController = require('../../controllers/auth.controller');
const validate = require('../../middlewares/validate');
const authValidator = require('../../validators/auth.validator');
const { authenticate } = require('../../middlewares/auth');
const { authRateLimiter } = require('../../middlewares/rateLimiter');

const router = express.Router();

// Apply auth rate limiter to all authentication routes
router.use(authRateLimiter);

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user account
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Secret123!
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *                 default: user
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error or account exists
 *       409:
 *         description: Email already in use
 */
router.post('/register', validate(authValidator.register), authController.register);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login with user credentials and get JWT token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Secret123!
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', validate(authValidator.login), authController.login);

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     summary: Get profile of current logged-in user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile details
 *       401:
 *         description: Unauthorized - missing or invalid token
 */
router.get('/me', authenticate, authController.getMe);

module.exports = router;

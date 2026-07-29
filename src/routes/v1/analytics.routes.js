const express = require('express');
const analyticsController = require('../../controllers/analytics.controller');
const { authenticate, authorize } = require('../../middlewares/auth');

const router = express.Router();

// All analytics endpoints require admin access
router.use(authenticate, authorize('admin'));

/**
 * @swagger
 * /api/v1/analytics/inventory:
 *   get:
 *     summary: Get Inventory & Order Analytics Dashboard Data (Admin only)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Inventory and order statistics summary
 *       403:
 *         description: Forbidden - Requires Admin role
 */
router.get('/inventory', analyticsController.getInventoryAnalytics);

module.exports = router;

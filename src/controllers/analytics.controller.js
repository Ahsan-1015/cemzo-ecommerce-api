const analyticsService = require('../services/analytics.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Get Inventory Analytics & Metrics
 * @route   GET /api/v1/analytics/inventory
 * @access  Private (Admin)
 */
const getInventoryAnalytics = asyncHandler(async (req, res) => {
  const analytics = await analyticsService.getInventoryAnalytics();
  return ApiResponse.success(
    res,
    200,
    'Inventory analytics generated successfully',
    analytics
  );
});

module.exports = {
  getInventoryAnalytics
};

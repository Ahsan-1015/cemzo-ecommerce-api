const Product = require('../models/Product');
const Order = require('../models/Order');

class AnalyticsService {
  /**
   * Generate comprehensive inventory and order analytics summary
   */
  async getInventoryAnalytics() {
    const [
      totalProducts,
      activeProducts,
      lowStockProducts,
      inventoryStats,
      orderStats,
      categoryStats
    ] = await Promise.all([
      Product.countDocuments({ isDeleted: false }),
      Product.countDocuments({ isDeleted: false, isActive: true }),
      Product.find({
        isDeleted: false,
        isActive: true,
        $expr: { $lte: [{ $subtract: ['$stock', '$reservedStock'] }, 5] }
      }).select('title sku stock reservedStock price category'),
      Product.aggregate([
        { $match: { isDeleted: false } },
        {
          $group: {
            _id: null,
            totalStockQuantity: { $sum: '$stock' },
            totalReservedStockQuantity: { $sum: '$reservedStock' },
            totalInventoryValue: { $sum: { $multiply: ['$stock', '$price'] } }
          }
        }
      ]),
      Order.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalRevenue: { $sum: '$totalPrice' }
          }
        }
      ]),
      Product.aggregate([
        { $match: { isDeleted: false } },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            avgPrice: { $avg: '$price' },
            totalCategoryStock: { $sum: '$stock' }
          }
        },
        { $sort: { count: -1 } }
      ])
    ]);

    const stats = inventoryStats[0] || {
      totalStockQuantity: 0,
      totalReservedStockQuantity: 0,
      totalInventoryValue: 0
    };

    return {
      overview: {
        totalProducts,
        activeProducts,
        totalStockQuantity: stats.totalStockQuantity,
        totalReservedStockQuantity: stats.totalReservedStockQuantity,
        totalInventoryValue: Math.round(stats.totalInventoryValue * 100) / 100
      },
      lowStockAlerts: {
        threshold: 5,
        count: lowStockProducts.length,
        items: lowStockProducts
      },
      orderMetrics: orderStats,
      categoryBreakdown: categoryStats
    };
  }
}

module.exports = new AnalyticsService();

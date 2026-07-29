const Order = require('../models/Order');
const Product = require('../models/Product');
const ApiError = require('../utils/ApiError');

class OrderService {
  /**
   * Create a new order with atomic stock validation and deduction
   * @param {string} userId - ID of authenticated user
   * @param {Array} items - Array of { product: productId, quantity }
   */
  async createOrder(userId, items) {
    if (!items || items.length === 0) {
      throw ApiError.badRequest('Order must contain at least one item.');
    }

    const orderProducts = [];
    let subtotal = 0;

    // Process each line item
    for (const item of items) {
      const product = await Product.findOne({
        _id: item.product,
        isDeleted: false,
        isActive: true
      });

      if (!product) {
        throw ApiError.notFound(`Product with ID '${item.product}' not found or is inactive.`);
      }

      if (product.stock < item.quantity) {
        throw ApiError.badRequest(
          `Insufficient stock for '${product.title}'. Requested: ${item.quantity}, Current Stock: ${product.stock}`
        );
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderProducts.push({
        product: product._id,
        title: product.title,
        quantity: item.quantity,
        priceAtPurchase: product.price
      });
    }

    // Deduct stock and reset/adjust reserved stock for each item atomically
    for (const item of items) {
      const updatedProduct = await Product.findOneAndUpdate(
        {
          _id: item.product,
          stock: { $gte: item.quantity }
        },
        {
          $inc: {
            stock: -item.quantity,
            reservedStock: 0 // Keep reserved stock non-negative
          }
        },
        { new: true }
      );

      if (!updatedProduct) {
        throw ApiError.badRequest(
          `Order placement failed due to concurrent stock change for product ID '${item.product}'.`
        );
      }
    }

    const totalPrice = subtotal; // Can extend with tax/shipping if needed

    const order = await Order.create({
      user: userId,
      products: orderProducts,
      subtotal,
      totalPrice,
      status: 'pending'
    });

    const populatedOrder = await Order.findById(order._id)
      .populate('user', 'name email')
      .populate('products.product', 'title sku image category');

    return populatedOrder;
  }

  /**
   * Get user order history with pagination
   * @param {string} userId
   * @param {object} queryOptions - { page, limit }
   */
  async getUserOrderHistory(userId, queryOptions = {}) {
    const { page = 1, limit = 10 } = queryOptions;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [orders, totalItems] = await Promise.all([
      Order.find({ user: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('products.product', 'title sku image price'),
      Order.countDocuments({ user: userId })
    ]);

    const totalPages = Math.ceil(totalItems / limitNum);

    return {
      orders,
      pagination: {
        totalItems,
        totalPages,
        currentPage: pageNum,
        limit: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    };
  }

  /**
   * Get order by ID
   * @param {string} orderId
   * @param {string} userId - Optional user ID for ownership check
   * @param {string} userRole - User role ('user' | 'admin')
   */
  async getOrderById(orderId, userId = null, userRole = 'user') {
    const order = await Order.findById(orderId)
      .populate('user', 'name email')
      .populate('products.product', 'title sku image category');

    if (!order) {
      throw ApiError.notFound(`Order not found with ID '${orderId}'`);
    }

    // Check ownership if user is not admin
    if (userRole !== 'admin' && order.user._id.toString() !== userId) {
      throw ApiError.forbidden('You do not have permission to view this order.');
    }

    return order;
  }

  /**
   * Update order status (Admin only)
   * @param {string} orderId
   * @param {string} status - New status
   */
  async updateOrderStatus(orderId, status) {
    const order = await Order.findById(orderId);
    if (!order) {
      throw ApiError.notFound(`Order not found with ID '${orderId}'`);
    }

    // If order is being cancelled, restore inventory
    if (status === 'cancelled' && order.status !== 'cancelled') {
      for (const item of order.products) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity }
        });
      }
    }

    order.status = status;
    await order.save();

    return order;
  }
}

module.exports = new OrderService();

const Product = require('../models/Product');
const ApiError = require('../utils/ApiError');

class ProductService {
  /**
   * Create a new product
   * @param {object} productData
   */
  async createProduct(productData) {
    const existingSku = await Product.findOne({
      sku: productData.sku.toUpperCase(),
      isDeleted: { $ne: true }
    });
    if (existingSku) {
      throw ApiError.conflict(`Product with SKU '${productData.sku}' already exists.`);
    }

    const product = await Product.create(productData);
    return product;
  }

  /**
   * Get single product by ID
   * @param {string} productId
   */
  async getProductById(productId) {
    const product = await Product.findOne({ _id: productId, isDeleted: { $ne: true } });
    if (!product) {
      throw ApiError.notFound(`Product not found with ID '${productId}'`);
    }
    return product;
  }

  /**
   * Update product by ID
   * @param {string} productId
   * @param {object} updateData
   */
  async updateProduct(productId, updateData) {
    if (updateData.sku) {
      const existingSku = await Product.findOne({
        sku: updateData.sku.toUpperCase(),
        _id: { $ne: productId },
        isDeleted: { $ne: true }
      });
      if (existingSku) {
        throw ApiError.conflict(`Product with SKU '${updateData.sku}' already exists.`);
      }
    }

    const product = await Product.findOneAndUpdate(
      { _id: productId, isDeleted: { $ne: true } },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!product) {
      throw ApiError.notFound(`Product not found with ID '${productId}'`);
    }

    return product;
  }

  /**
   * Soft delete product by ID
   * @param {string} productId
   */
  async deleteProduct(productId) {
    const product = await Product.findOneAndUpdate(
      { _id: productId, isDeleted: false },
      { $set: { isDeleted: true, isActive: false } },
      { new: true }
    );

    if (!product) {
      throw ApiError.notFound(`Product not found with ID '${productId}'`);
    }

    return product;
  }

  /**
   * Query products with pagination, search, sorting, and filtering
   * @param {object} queryOptions
   */
  async queryProducts(queryOptions) {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      minPrice,
      maxPrice,
      inStock,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = queryOptions;

    const query = { isDeleted: { $ne: true }, isActive: true };

    // Search filter across title, description, category, sku
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }

    // Category filter
    if (category) {
      query.category = { $regex: `^${category}$`, $options: 'i' };
    }

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) query.price.$lte = Number(maxPrice);
    }

    // In Stock filter
    if (inStock === true || inStock === 'true') {
      query.$expr = { $gt: [{ $subtract: ['$stock', '$reservedStock'] }, 0] };
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [products, totalItems] = await Promise.all([
      Product.find(query).sort(sort).skip(skip).limit(limitNum),
      Product.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalItems / limitNum);

    return {
      products,
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
   * Reserve product stock
   * @param {string} productId
   * @param {number} quantity
   */
  async reserveStock(productId, quantity) {
    const product = await Product.findOne({ _id: productId, isDeleted: false, isActive: true });
    if (!product) {
      throw ApiError.notFound(`Product not found with ID '${productId}'`);
    }

    const availableStock = product.stock - product.reservedStock;
    if (availableStock < quantity) {
      throw ApiError.badRequest(
        `Insufficient stock for product '${product.title}'. Requested: ${quantity}, Available: ${availableStock}`
      );
    }

    // Atomically increment reserved stock
    const updatedProduct = await Product.findOneAndUpdate(
      {
        _id: productId,
        isDeleted: false,
        $expr: { $gte: [{ $subtract: ['$stock', '$reservedStock'] }, quantity] }
      },
      { $inc: { reservedStock: quantity } },
      { new: true }
    );

    if (!updatedProduct) {
      throw ApiError.badRequest(
        `Stock reservation failed for product '${product.title}'. Stock state changed.`
      );
    }

    return updatedProduct;
  }
}

module.exports = new ProductService();

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

/**
 * Connect to MongoDB with automatic In-Memory fallback for seamless development
 */
const connectDB = async () => {
  const connStr = process.env.MONGODB_URI;

  // Try Atlas or explicit URI first
  if (connStr) {
    try {
      console.log(`[Database] Attempting connection to MongoDB (${connStr.split('@').pop() || 'local'})...`);
      const conn = await mongoose.connect(connStr, { serverSelectionTimeoutMS: 4000 });
      console.log(`[Database] MongoDB Connected Successfully: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      console.warn(`[Database Warning] External MongoDB connection failed (${error.message}).`);
      console.warn(`[Database Warning] Falling back to In-Memory MongoDB for local development...`);
    }
  }

  // Fallback to MongoMemoryServer so the API works out-of-the-box
  try {
    const mongoServer = await MongoMemoryServer.create();
    const memoryUri = mongoServer.getUri();
    const conn = await mongoose.connect(memoryUri);
    console.log(`[Database] Connected to In-Memory MongoDB: ${memoryUri}`);

    // Auto-seed in-memory database if empty
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log(`[Database] Auto-seeding initial products & users into In-Memory database...`);
      await seedInMemoryData();
    }

    return conn;
  } catch (err) {
    console.error(`[Database Error] ${err.message}`);
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
  }
};

/**
 * Auto-seed helper for in-memory database
 */
const seedInMemoryData = async () => {
  const users = [
    { name: 'System Admin', email: 'admin@cemzo.com', password: 'AdminPassword123!', role: 'admin' },
    { name: 'Alice Johnson', email: 'alice@example.com', password: 'UserPassword123!', role: 'user' },
    { name: 'Bob Smith', email: 'bob@example.com', password: 'UserPassword123!', role: 'user' }
  ];

  const products = [
    {
      title: 'Sony WH-1000XM5 Wireless Headphones',
      description: 'Industry-leading noise-canceling headphones with 30-hour battery life.',
      category: 'Electronics',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
      sku: 'AUDIO-SONY-001',
      price: 399.99,
      stock: 45,
      reservedStock: 2,
      isActive: true
    },
    {
      title: 'Apple MacBook Pro 16-inch M3 Max',
      description: 'Apple M3 Max chip, 36GB unified memory, 1TB SSD storage.',
      category: 'Computers',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8',
      sku: 'COMP-APPL-002',
      price: 3499.00,
      stock: 15,
      reservedStock: 1,
      isActive: true
    },
    {
      title: 'Logitech MX Master 3S Wireless Mouse',
      description: 'Performance wireless ergonomic mouse with 8K DPI tracking.',
      category: 'Electronics',
      image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46',
      sku: 'ACC-LOGI-003',
      price: 99.99,
      stock: 80,
      reservedStock: 5,
      isActive: true
    },
    {
      title: 'Nike Air Max 270 Sneakers',
      description: 'Men running shoes featuring lightweight mesh upper and Max Air unit.',
      category: 'Footwear',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
      sku: 'SHOE-NIKE-006',
      price: 150.00,
      stock: 60,
      reservedStock: 3,
      isActive: true
    },
    {
      title: 'De Longhi Magnifica S Espresso Machine',
      description: 'Automatic bean-to-cup espresso machine with integrated milk frother.',
      category: 'Home & Kitchen',
      image: 'https://images.unsplash.com/photo-1517668808822-9ebe02f2a8e4',
      sku: 'KIT-DELO-011',
      price: 549.95,
      stock: 12,
      reservedStock: 0,
      isActive: true
    }
  ];

  for (const u of users) {
    await User.create(u);
  }
  await Product.insertMany(products);
  console.log(`[Database] Auto-seeded 5 sample products and 3 accounts into In-Memory database.`);
};

module.exports = connectDB;

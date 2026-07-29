const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

dotenv.config();

const users = [
  {
    name: 'System Admin',
    email: 'admin@cemzo.com',
    password: 'AdminPassword123!',
    role: 'admin'
  },
  {
    name: 'Alice Johnson',
    email: 'alice@example.com',
    password: 'UserPassword123!',
    role: 'user'
  },
  {
    name: 'Bob Smith',
    email: 'bob@example.com',
    password: 'UserPassword123!',
    role: 'user'
  }
];

const products = [
  {
    title: 'Sony WH-1000XM5 Wireless Headphones',
    description: 'Industry-leading noise-canceling headphones with 30-hour battery life and premium voice calls.',
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    sku: 'AUDIO-SONY-001',
    price: 399.99,
    stock: 45,
    reservedStock: 2,
    isActive: true
  },
  {
    title: 'Apple MacBook Pro 16-inch M3 Max',
    description: 'Blazing-fast Apple M3 Max chip, 36GB unified memory, 1TB SSD storage, Liquid Retina XDR display.',
    category: 'Computers',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
    sku: 'COMP-APPL-002',
    price: 3499.00,
    stock: 15,
    reservedStock: 1,
    isActive: true
  },
  {
    title: 'Logitech MX Master 3S Wireless Mouse',
    description: 'Performance wireless ergonomic mouse with 8K DPI tracking and quiet clicks.',
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80',
    sku: 'ACC-LOGI-003',
    price: 99.99,
    stock: 80,
    reservedStock: 5,
    isActive: true
  },
  {
    title: 'Keychron Q1 Pro Mechanical Keyboard',
    description: '75% layout QMK/VIA wireless custom mechanical keyboard with CNC aluminum body.',
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
    sku: 'KEYB-KEYC-004',
    price: 199.50,
    stock: 30,
    reservedStock: 0,
    isActive: true
  },
  {
    title: 'Dell UltraSharp 27 4K USB-C Hub Monitor',
    description: '27-inch 4K UHD monitor with IPS Black panel, 98% DCI-P3 color coverage, and 90W Power Delivery.',
    category: 'Computers',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
    sku: 'MON-DELL-005',
    price: 619.99,
    stock: 20,
    reservedStock: 0,
    isActive: true
  },
  {
    title: 'Nike Air Max 270 Sneakers',
    description: 'Men\'s running shoes featuring lightweight mesh upper and large Max Air unit for cushioning.',
    category: 'Footwear',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
    sku: 'SHOE-NIKE-006',
    price: 150.00,
    stock: 60,
    reservedStock: 3,
    isActive: true
  },
  {
    title: 'Adidas Ultraboost Light Running Shoes',
    description: 'Lightweight energetic running shoes crafted with recycled materials and Responsive Light BOOST.',
    category: 'Footwear',
    image: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80',
    sku: 'SHOE-ADID-007',
    price: 189.95,
    stock: 40,
    reservedStock: 0,
    isActive: true
  },
  {
    title: 'North Face Thermoball Eco Jacket',
    description: 'Packable water-resistant winter jacket insulated with 100% recycled synthetic down.',
    category: 'Apparel',
    image: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80',
    sku: 'APP-TNF-008',
    price: 220.00,
    stock: 25,
    reservedStock: 1,
    isActive: true
  },
  {
    title: 'Levi\'s 501 Original Fit Jeans',
    description: 'Classic straight leg denim jeans with signature button fly and timeless style.',
    category: 'Apparel',
    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80',
    sku: 'APP-LEVI-009',
    price: 79.50,
    stock: 100,
    reservedStock: 4,
    isActive: true
  },
  {
    title: 'Ray-Ban Classic Wayfarer Sunglasses',
    description: 'Iconic polarized acetate sunglasses providing 100% UV protection.',
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80',
    sku: 'ACC-RAYB-010',
    price: 163.00,
    stock: 50,
    reservedStock: 2,
    isActive: true
  },
  {
    title: 'De\'Longhi Magnifica S Espresso Machine',
    description: 'Automatic bean-to-cup espresso machine with integrated milk frother.',
    category: 'Home & Kitchen',
    image: 'https://images.unsplash.com/photo-1517668808822-9ebe02f2a8e4?auto=format&fit=crop&w=800&q=80',
    sku: 'KIT-DELO-011',
    price: 549.95,
    stock: 12,
    reservedStock: 0,
    isActive: true
  },
  {
    title: 'Ninja Air Fryer Max XL 5.5QT',
    description: 'High-performance air fryer with Max Crisp Technology and ceramic nonstick basket.',
    category: 'Home & Kitchen',
    image: 'https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=800&q=80',
    sku: 'KIT-NINJ-012',
    price: 129.99,
    stock: 35,
    reservedStock: 1,
    isActive: true
  },
  {
    title: 'Dyson V15 Detect Cordless Vacuum',
    description: 'Intelligent cordless vacuum with laser illumination and HEPA filtration system.',
    category: 'Home & Kitchen',
    image: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=800&q=80',
    sku: 'HOM-DYSO-013',
    price: 749.99,
    stock: 8,
    reservedStock: 0,
    isActive: true
  },
  {
    title: 'Kindle Paperwhite 16GB Display',
    description: '6.8-inch display with adjustable warm light and 10 weeks of battery life.',
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    sku: 'ELEC-KIND-014',
    price: 149.99,
    stock: 45,
    reservedStock: 0,
    isActive: true
  },
  {
    title: 'Bose SoundLink Flex Bluetooth Speaker',
    description: 'Portable waterproof outdoor speaker with PositionIQ technology and deep bass.',
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80',
    sku: 'AUDIO-BOSE-015',
    price: 149.00,
    stock: 55,
    reservedStock: 2,
    isActive: true
  },
  {
    title: 'Anker PowerCore 24000mAh Power Bank',
    description: '140W ultra-fast portable charger with smart digital display for laptops and phones.',
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1609592424089-6d60a1e05001?auto=format&fit=crop&w=800&q=80',
    sku: 'ACC-ANKR-016',
    price: 99.99,
    stock: 75,
    reservedStock: 3,
    isActive: true
  },
  {
    title: 'Stanley Quencher H2.0 Tumbler 40oz',
    description: 'Vacuum insulated stainless steel travel mug with lid and straw.',
    category: 'Home & Kitchen',
    image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=800&q=80',
    sku: 'KIT-STAN-017',
    price: 45.00,
    stock: 90,
    reservedStock: 5,
    isActive: true
  },
  {
    title: 'Bowflex SelectTech 552 Adjustable Dumbbells',
    description: 'Adjustable dumbbell pair replacing 15 sets of weights from 5 to 52.5 lbs.',
    category: 'Fitness',
    image: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80',
    sku: 'FIT-BOWF-018',
    price: 429.00,
    stock: 10,
    reservedStock: 1,
    isActive: true
  },
  {
    title: 'Lululemon Align High-Rise Pant 25"',
    description: 'Ultra-lightweight yoga leggings made with buttery-soft Nulu fabric.',
    category: 'Apparel',
    image: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&w=800&q=80',
    sku: 'APP-LULU-019',
    price: 98.00,
    stock: 4,
    reservedStock: 0,
    isActive: true
  },
  {
    title: 'Samsung Galaxy Watch 6 Classic',
    description: 'Smartwatch with rotating bezel, advanced sleep coaching, and ECG monitoring.',
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80',
    sku: 'ELEC-SAMS-020',
    price: 399.99,
    stock: 3,
    reservedStock: 0,
    isActive: true
  }
];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cemzo_ecommerce';
    console.log(`[Seed] Connecting to database...`);
    
    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 4000 });
      console.log(`[Seed] Connected to external MongoDB successfully.`);
    } catch (connErr) {
      console.warn(`[Seed Warning] Atlas connection failed (${connErr.message}). Using In-Memory MongoDB...`);
      const mongoServer = await MongoMemoryServer.create();
      const memoryUri = mongoServer.getUri();
      await mongoose.connect(memoryUri);
      console.log(`[Seed] Connected to In-Memory MongoDB: ${memoryUri}`);
    }

    console.log(`[Seed] Clearing existing collections and syncing indexes...`);
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Order.deleteMany({})
    ]);

    try {
      await User.collection.dropIndex('id_1');
    } catch (idxErr) {
      // Ignore if index doesn't exist
    }
    await User.syncIndexes();
    await Product.syncIndexes();

    console.log(`[Seed] Inserting users (1 Admin, 2 Regular Users)...`);
    const createdUsers = [];
    for (const userData of users) {
      const user = await User.create(userData);
      createdUsers.push(user);
    }
    console.log(`[Seed] Created ${createdUsers.length} users successfully.`);

    console.log(`[Seed] Inserting 20 products...`);
    const createdProducts = await Product.insertMany(products);
    console.log(`[Seed] Created ${createdProducts.length} products successfully.`);

    console.log(`[Seed] Creating sample order...`);
    const userAlice = createdUsers.find(u => u.email === 'alice@example.com');
    const p1 = createdProducts[0];
    const p2 = createdProducts[2];

    const subtotal = (p1.price * 1) + (p2.price * 2);
    await Order.create({
      user: userAlice._id,
      products: [
        {
          product: p1._id,
          title: p1.title,
          quantity: 1,
          priceAtPurchase: p1.price
        },
        {
          product: p2._id,
          title: p2.title,
          quantity: 2,
          priceAtPurchase: p2.price
        }
      ],
      subtotal,
      totalPrice: subtotal,
      status: 'completed'
    });
    console.log(`[Seed] Created sample order for ${userAlice.email}.`);

    console.log('========================================');
    console.log(' 🎉 SEEDING COMPLETED SUCCESSFULLY!');
    console.log('========================================');
    console.log(' Credentials Created:');
    console.log('   Admin: admin@cemzo.com / AdminPassword123!');
    console.log('   User 1: alice@example.com / UserPassword123!');
    console.log('   User 2: bob@example.com / UserPassword123!');
    console.log('========================================');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error);
    process.exit(1);
  }
};

seedDB();

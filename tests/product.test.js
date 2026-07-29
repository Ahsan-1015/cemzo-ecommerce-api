const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const Product = require('../src/models/Product');

describe('Product Endpoints', () => {
  let adminToken;
  let userToken;

  beforeEach(async () => {
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'AdminPassword123!',
      role: 'admin'
    });
    adminToken = admin.generateAuthToken();

    const normalUser = await User.create({
      name: 'Normal User',
      email: 'user@test.com',
      password: 'UserPassword123!',
      role: 'user'
    });
    userToken = normalUser.generateAuthToken();
  });

  describe('POST /api/v1/products', () => {
    it('should allow admin to create a product', async () => {
      const productPayload = {
        title: 'Wireless Headphones',
        description: 'High quality audio headphones with noise cancellation',
        category: 'Electronics',
        image: 'https://example.com/headphones.jpg',
        sku: 'TEST-AUDIO-01',
        price: 199.99,
        stock: 50
      };

      const res = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(productPayload);

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.product.sku).toBe('TEST-AUDIO-01');
    });

    it('should forbid non-admin user from creating a product', async () => {
      const res = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Unauthorized Product',
          description: 'Desc',
          category: 'Category',
          image: 'https://example.com/img.jpg',
          sku: 'TEST-UNAUTH-01',
          price: 99.99,
          stock: 10
        });

      expect(res.statusCode).toEqual(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/products', () => {
    beforeEach(async () => {
      await Product.insertMany([
        {
          title: 'Laptop Air',
          description: 'Ultra thin laptop',
          category: 'Electronics',
          image: 'https://example.com/laptop.jpg',
          sku: 'LAP-001',
          price: 999.99,
          stock: 20
        },
        {
          title: 'Running Shoes',
          description: 'Comfortable athletic shoes',
          category: 'Footwear',
          image: 'https://example.com/shoes.jpg',
          sku: 'SHOE-001',
          price: 89.99,
          stock: 30
        }
      ]);
    });

    it('should return products with pagination metadata', async () => {
      const res = await request(app).get('/api/v1/products?page=1&limit=10');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.products.length).toBe(2);
      expect(res.body.pagination).toHaveProperty('totalItems', 2);
    });

    it('should filter products by category', async () => {
      const res = await request(app).get('/api/v1/products?category=Electronics');

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.products.length).toBe(1);
      expect(res.body.data.products[0].sku).toBe('LAP-001');
    });

    it('should search products by query keyword', async () => {
      const res = await request(app).get('/api/v1/products?search=Running');

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.products.length).toBe(1);
      expect(res.body.data.products[0].title).toBe('Running Shoes');
    });
  });

  describe('POST /api/v1/products/:id/reserve', () => {
    it('should reserve product stock when available', async () => {
      const product = await Product.create({
        title: 'Gaming Mouse',
        description: 'RGB gaming mouse',
        category: 'Electronics',
        image: 'https://example.com/mouse.jpg',
        sku: 'MOUSE-001',
        price: 49.99,
        stock: 10,
        reservedStock: 0
      });

      const res = await request(app)
        .post(`/api/v1/products/${product._id}/reserve`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 3 });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.product.reservedStock).toBe(3);
    });

    it('should fail to reserve stock when quantity exceeds available stock', async () => {
      const product = await Product.create({
        title: 'Limited Item',
        description: 'Rare product',
        category: 'Collectibles',
        image: 'https://example.com/item.jpg',
        sku: 'RARE-001',
        price: 500.00,
        stock: 2,
        reservedStock: 0
      });

      const res = await request(app)
        .post(`/api/v1/products/${product._id}/reserve`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 5 });

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Insufficient stock');
    });
  });

  describe('DELETE /api/v1/products/:id', () => {
    it('should soft delete product (isDeleted: true, isActive: false) when requested by admin', async () => {
      const product = await Product.create({
        title: 'Delete Test Product',
        description: 'To be deleted',
        category: 'Electronics',
        image: 'https://example.com/delete.jpg',
        sku: 'DEL-001',
        price: 99.99,
        stock: 5
      });

      const res = await request(app)
        .delete(`/api/v1/products/${product._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);

      // Verify soft deletion status in DB
      const dbProduct = await Product.findById(product._id);
      expect(dbProduct).not.toBeNull();
      expect(dbProduct.isDeleted).toBe(true);
      expect(dbProduct.isActive).toBe(false);
    });

    it('should allow creating a new product with the same SKU after soft deletion', async () => {
      const product = await Product.create({
        title: 'Original Product',
        description: 'First version',
        category: 'Electronics',
        image: 'https://example.com/item1.jpg',
        sku: 'REUSE-SKU-001',
        price: 50.00,
        stock: 10
      });

      // Soft delete original product
      await request(app)
        .delete(`/api/v1/products/${product._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      // Create new product with same SKU
      const res = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Replaced Product',
          description: 'Second version with same SKU',
          category: 'Electronics',
          image: 'https://example.com/item2.jpg',
          sku: 'REUSE-SKU-001',
          price: 60.00,
          stock: 15
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.product.sku).toBe('REUSE-SKU-001');
    });

    it('should return 404 when attempting to delete a product that was already soft deleted', async () => {
      const product = await Product.create({
        title: 'Delete Twice Test',
        description: 'To be deleted twice',
        category: 'Electronics',
        image: 'https://example.com/delete2.jpg',
        sku: 'DEL-002',
        price: 49.99,
        stock: 10
      });

      // First delete
      await request(app)
        .delete(`/api/v1/products/${product._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      // Second delete attempt
      const res = await request(app)
        .delete(`/api/v1/products/${product._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe(`Product not found with ID '${product._id}'`);
    });
  });
});

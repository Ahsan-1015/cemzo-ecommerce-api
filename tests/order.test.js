const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const Product = require('../src/models/Product');
const Order = require('../src/models/Order');

describe('Order Endpoints', () => {
  let userToken;
  let adminToken;
  let userId;
  let product1;
  let product2;

  beforeEach(async () => {
    const user = await User.create({
      name: 'Order User',
      email: 'orderuser@test.com',
      password: 'UserPassword123!',
      role: 'user'
    });
    userId = user._id;
    userToken = user.generateAuthToken();

    const admin = await User.create({
      name: 'Admin User',
      email: 'orderadmin@test.com',
      password: 'AdminPassword123!',
      role: 'admin'
    });
    adminToken = admin.generateAuthToken();

    product1 = await Product.create({
      title: 'Mechanical Keyboard',
      description: 'Tactile mechanical keyboard',
      category: 'Electronics',
      image: 'https://example.com/keyboard.jpg',
      sku: 'ORD-KEYB-01',
      price: 100.00,
      stock: 10
    });

    product2 = await Product.create({
      title: 'USB-C Cable',
      description: 'Fast charging braided cable',
      category: 'Electronics',
      image: 'https://example.com/cable.jpg',
      sku: 'ORD-CABL-02',
      price: 15.00,
      stock: 20
    });
  });

  describe('POST /api/v1/orders', () => {
    it('should create an order and deduct product stock', async () => {
      const res = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          products: [
            { product: product1._id.toString(), quantity: 2 },
            { product: product2._id.toString(), quantity: 1 }
          ]
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.order).toHaveProperty('_id');
      expect(res.body.data.order.subtotal).toBe(215.00); // (100*2) + (15*1)
      expect(res.body.data.order.totalPrice).toBe(215.00);

      // Verify stock was deducted
      const updatedProduct1 = await Product.findById(product1._id);
      expect(updatedProduct1.stock).toBe(8); // 10 - 2

      const updatedProduct2 = await Product.findById(product2._id);
      expect(updatedProduct2.stock).toBe(19); // 20 - 1
    });

    it('should fail to create order if requested quantity exceeds stock', async () => {
      const res = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          products: [{ product: product1._id.toString(), quantity: 50 }]
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Insufficient stock');
    });
  });

  describe('GET /api/v1/orders/history', () => {
    it('should fetch order history for authenticated user', async () => {
      await Order.create({
        user: userId,
        products: [
          {
            product: product1._id,
            title: product1.title,
            quantity: 1,
            priceAtPurchase: 100.00
          }
        ],
        subtotal: 100.00,
        totalPrice: 100.00,
        status: 'completed'
      });

      const res = await request(app)
        .get('/api/v1/orders/history')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.orders.length).toBe(1);
      expect(res.body.data.orders[0].subtotal).toBe(100.00);
    });
  });

  describe('PATCH /api/v1/orders/:id/status', () => {
    it('should allow admin to update order status', async () => {
      const order = await Order.create({
        user: userId,
        products: [
          {
            product: product1._id,
            title: product1.title,
            quantity: 1,
            priceAtPurchase: 100.00
          }
        ],
        subtotal: 100.00,
        totalPrice: 100.00,
        status: 'pending'
      });

      const res = await request(app)
        .patch(`/api/v1/orders/${order._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'completed' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.order.status).toBe('completed');
    });
  });
});

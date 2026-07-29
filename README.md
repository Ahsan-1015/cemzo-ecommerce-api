# 🛒 Cemzo E-Commerce Inventory & Order REST API

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-v4.21-blue.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%208.9-brightgreen.svg)](https://mongoosejs.com/)
[![License](https://img.shields.io/badge/License-ISC-yellow.svg)](LICENSE)

A production-ready, high-performance RESTful API built with **Node.js**, **Express.js**, **MongoDB Atlas**, **Mongoose**, **JWT Authentication**, and **Joi Validation**.

### 🌐 Live Deployment Links
- 🚀 **Live API Service**: [https://cemzo-ecommerce-api.onrender.com/](https://cemzo-ecommerce-api.onrender.com/)
- 📖 **Live Swagger UI Documentation**: [https://cemzo-ecommerce-api.onrender.com/api-docs](https://cemzo-ecommerce-api.onrender.com/api-docs)

Designed following clean MVC / Layered architecture best practices, this API manages user authentication, product catalog inventory, atomic stock reservations, order processing with automated inventory deduction, and real-time inventory analytics.

---

## 📌 Features

- 🔐 **Authentication & Security**: JWT Authentication, bcrypt password hashing, HTTP-Only Cookies, Role-Based Access Control (RBAC: `user`, `admin`), Helmet headers, CORS control, and `express-rate-limit` rate limiters.
- 📦 **Product Catalog Management**: Complete CRUD operations, soft deletion (`isDeleted`), SKU uniqueness enforcement, image URL validation, and full-text search indexing.
- 🔍 **Advanced Query Engine**: Pagination (`page`, `limit`), Keyword Search, Field Sorting (`sortBy`, `sortOrder`), and Multi-parameter Filtering (`category`, `minPrice`, `maxPrice`, `inStock`).
- ⚡ **Stock Reservation System**: Reserve stock prior to checkout with atomic validation to prevent overselling.
- 🛒 **Order Processing Engine**: Multi-item order placement with real-time stock validation, atomic stock deduction, user order history, and status updates (restoring stock upon order cancellation).
- 📊 **Inventory Analytics Dashboard**: Real-time business metrics including low-stock alerts, total inventory valuation, category breakdown, and order metrics.
- 📖 **Interactive Swagger Documentation**: Auto-generated Swagger UI served directly at `/api-docs`.
- 🌱 **Database Seeding**: CLI command to seed the database with 20 realistic products, 2 regular users, and 1 admin account.
- 🧪 **Automated Testing Suite**: Integration tests using **Jest**, **Supertest**, and **mongodb-memory-server** for fast, isolated test runs without an external database connection.

---

## 📂 Folder Structure

```
cemzo-ecommerce-api/
├── src/
│   ├── config/
│   │   ├── db.js              # MongoDB connection setup
│   │   └── swagger.js         # OpenAPI 3.0 / Swagger JSDoc specs
│   ├── controllers/
│   │   ├── analytics.controller.js
│   │   ├── auth.controller.js
│   │   ├── order.controller.js
│   │   └── product.controller.js
│   ├── middlewares/
│   │   ├── auth.js            # JWT verification & RBAC authorization
│   │   ├── errorHandler.js    # Global centralized error middleware
│   │   ├── rateLimiter.js     # Rate limiting configuration
│   │   └── validate.js        # Request validator using Joi
│   ├── models/
│   │   ├── Order.js           # Order schema with line items & totals
│   │   ├── Product.js         # Product schema with stock & soft delete
│   │   └── User.js            # User schema with bcrypt & JWT logic
│   ├── routes/
│   │   └── v1/
│   │       ├── analytics.routes.js
│   │       ├── auth.routes.js
│   │       ├── index.js       # Main v1 router
│   │       ├── order.routes.js
│   │       └── product.routes.js
│   ├── services/              # Pure business logic layer
│   │   ├── analytics.service.js
│   │   ├── auth.service.js
│   │   ├── order.service.js
│   │   └── product.service.js
│   ├── validators/            # Joi request validation schemas
│   │   ├── auth.validator.js
│   │   ├── order.validator.js
│   │   └── product.validator.js
│   ├── utils/
│   │   ├── ApiError.js        # Custom Operational Error class
│   │   ├── ApiResponse.js     # Standardized JSON response helper
│   │   └── asyncHandler.js    # Async route wrapper
│   ├── seed/
│   │   └── seed.js            # CLI seed script
│   └── app.js                 # Express application configuration
├── tests/
│   ├── setup.js               # Jest setup with MongoMemoryServer
│   ├── auth.test.js
│   ├── order.test.js
│   └── product.test.js
├── server.js                  # Entry point with server listener & process hooks
├── .env.example               # Template environment variables
├── .env                       # Local environment file
├── .gitignore
├── package.json
├── render.yaml                # Deploy configuration for Render
└── README.md
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/cemzo_ecommerce
JWT_SECRET=super_secret_jwt_key_for_development_change_in_production
JWT_EXPIRES_IN=7d
CORS_ORIGIN=*
```

---

## 🚀 Quick Start & Installation

### 1. Prerequisites
- Node.js (v18+ recommended)
- MongoDB server running locally or a MongoDB Atlas connection URI

### 2. Installation
Clone the repository and install dependencies:

```bash
git clone https://github.com/your-username/cemzo-ecommerce-api.git
cd cemzo-ecommerce-api
npm install
```

### 3. Seed Database
Populate the database with default admin/user credentials and 20 sample products:

```bash
npm run seed
```

### 4. Run Development Server

```bash
npm run dev
```

The server will start at `http://localhost:5000`.

---

## 🧪 Running Automated Tests

Run the full integration test suite powered by `mongodb-memory-server`:

```bash
npm test
```

---

## 📖 API Documentation & Swagger

Interactive Swagger UI documentation is available out-of-the-box both locally and on live deployment:

- **Live Render Swagger UI**: [https://cemzo-ecommerce-api.onrender.com/api-docs](https://cemzo-ecommerce-api.onrender.com/api-docs)
- **Local Development**: `http://localhost:5000/api-docs`

### Key Endpoint Overview

| Method | Endpoint | Description | Auth Required | Role |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/health` | System health check & DB status | No | Public |
| `POST` | `/api/v1/auth/register` | Register new user | No | Public |
| `POST` | `/api/v1/auth/login` | Login & receive JWT | No | Public |
| `GET` | `/api/v1/auth/me` | Get current user profile | Yes | User / Admin |
| `GET` | `/api/v1/products` | Search, filter, & list products | No | Public |
| `POST` | `/api/v1/products` | Create product | Yes | Admin |
| `GET` | `/api/v1/products/:id` | Get product details | No | Public |
| `PATCH` | `/api/v1/products/:id` | Update product | Yes | Admin |
| `DELETE` | `/api/v1/products/:id` | Soft delete product | Yes | Admin |
| `POST` | `/api/v1/products/:id/reserve` | Reserve product stock | Yes | User / Admin |
| `POST` | `/api/v1/orders` | Place new order & deduct stock | Yes | User / Admin |
| `GET` | `/api/v1/orders/history` | Get user order history | Yes | User / Admin |
| `GET` | `/api/v1/orders/:id` | Get order details | Yes | User / Admin |
| `PATCH` | `/api/v1/orders/:id/status` | Update order status | Yes | Admin |
| `GET` | `/api/v1/analytics/inventory` | Inventory & Order Dashboard Analytics | Yes | Admin |

---

## 🔑 Default Credentials (After Seeding)

| User Type | Email | Password | Role |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@cemzo.com` | `AdminPassword123!` | `admin` |
| **User 1** | `alice@example.com` | `UserPassword123!` | `user` |
| **User 2** | `bob@example.com` | `UserPassword123!` | `user` |

---

## 🌐 Deployment to Render

This repository is ready for instant deployment on [Render](https://render.com/).

### Automatic Blueprint Deployment
1. Connect your GitHub repository to Render.
2. Render will automatically detect `render.yaml`.
3. Provide your `MONGODB_URI` environment variable in the Render Dashboard.
4. Render will run `npm install` and start the service with `npm start`.

---

## 📝 Error Handling Format

All responses follow a consistent, standardized format:

### Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": { "products": [...] },
  "pagination": {
    "totalItems": 20,
    "totalPages": 2,
    "currentPage": 1,
    "limit": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Error Response (`400 Bad Request` / `422 Unprocessable`)
```json
{
  "success": false,
  "message": "Validation failed for request parameters",
  "errors": [
    {
      "field": "body.price",
      "message": "Price must be greater than or equal to 0"
    }
  ]
}
```

---

## 📄 License

This project is licensed under the ISC License.

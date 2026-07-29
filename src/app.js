const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const mongoose = require('mongoose');

const swaggerSpec = require('./config/swagger');
const v1Router = require('./routes/v1');
const errorHandler = require('./middlewares/errorHandler');
const ApiError = require('./utils/ApiError');
const { apiRateLimiter } = require('./middlewares/rateLimiter');

const app = express();

// Security HTTP headers (disable CSP for Swagger UI compatibility)
app.use(helmet({ contentSecurityPolicy: false }));

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
  })
);

// HTTP request logger
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Body parsers & cookie parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Gzip compression
app.use(compression());

// General rate limiter for all API endpoints
app.use('/api', apiRateLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  const dbStateMap = {
    0: 'DISCONNECTED',
    1: 'CONNECTED',
    2: 'CONNECTING',
    3: 'DISCONNECTING'
  };
  const dbStatus = dbStateMap[mongoose.connection.readyState] || 'UNKNOWN';

  return res.status(200).json({
    success: true,
    message: 'Cemzo E-Commerce API is fully operational',
    data: {
      status: 'UP',
      uptime: `${Math.floor(process.uptime())}s`,
      timestamp: new Date().toISOString(),
      databaseStatus: dbStatus,
      apiVersion: 'v1'
    }
  });
});

// Swagger API Documentation UI Options for Render / Production
const swaggerUiOptions = {
  customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui.min.css',
  customJs: [
    'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-bundle.js',
    'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-standalone-preset.js'
  ],
  customCss: '.swagger-ui .topbar { display: none }',
  swaggerOptions: {
    persistAuthorization: true
  }
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

// API v1 Routes
app.use('/api/v1', v1Router);

// Root route redirect/welcome
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Cemzo E-Commerce REST API',
    docs: '/api-docs',
    health: '/health'
  });
});

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  next(ApiError.notFound(`Cannot ${req.method} ${req.originalUrl}`));
});

// Centralized error handler
app.use(errorHandler);

module.exports = app;

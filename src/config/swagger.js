const swaggerJSDoc = require('swagger-jsdoc');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Cemzo E-Commerce Inventory & Order REST API',
      version: '1.0.0',
      description:
        'Production-ready REST API for managing e-commerce inventory, stock reservations, order processing, and user authentication.',
      contact: {
        name: 'Cemzo Engineering Team',
        email: 'engineering@cemzo.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development Local Server'
      },
      {
        url: 'https://cemzo-ecommerce-api.onrender.com',
        description: 'Render Production Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token in the format: Bearer <token>'
        }
      }
    }
  },
  apis: [
    './src/routes/v1/*.js',
    './src/models/*.js'
  ]
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

module.exports = swaggerSpec;

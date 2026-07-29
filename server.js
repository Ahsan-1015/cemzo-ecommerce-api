const dotenv = require('dotenv');
dotenv.config();

const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

const server = app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`🚀 Cemzo E-Commerce API Server Running`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Local URL:   http://localhost:${PORT}`);
  console.log(`📚 API Docs:    http://localhost:${PORT}/api-docs`);
  console.log(`💓 Health:      http://localhost:${PORT}/health`);
  console.log(`=================================================`);
});

// Handle server startup errors (e.g. port already in use)
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ [Server Error] Port ${PORT} is already in use by another process.`);
    console.error(`💡 [Fix] Kill the process using port ${PORT} with: fuser -k ${PORT}/tcp`);
    process.exit(1);
  } else {
    console.error('❌ [Server Error]', err);
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('[UNHANDLED REJECTION] Shutting down server gracefully...', err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  if (err.code === 'EADDRINUSE') return; // Handled by server.on('error')
  console.error('[UNCAUGHT EXCEPTION] Shutting down server immediately...', err);
  process.exit(1);
});

// Handle graceful termination signal (e.g. Render, Docker, Heroku)
process.on('SIGTERM', () => {
  console.log('👋 [SIGTERM RECEIVED] Shutting down HTTP server...');
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});

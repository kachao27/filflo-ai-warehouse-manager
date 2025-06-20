const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const brainRoutes = require('./routes/brainRoutes');
const db = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// A robust CORS configuration for production environments
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  // Regex to match any Vercel deployment URL for this project
  /^https:\/\/filflo-ai-warehouse-manager-6irt-.*\.vercel\.app$/
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Check if the origin is in the allowed list or matches the regex
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return allowedOrigin === origin;
      }
      if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return false;
    });

    if (isAllowed) {
      return callback(null, true);
    } else {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
  },
  credentials: true
}));

// General rate limiting
const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes per IP
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  }
});

app.use(generalRateLimit);
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint (before routes)
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'FilFlo Brain API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API routes
app.use('/api/brain', brainRoutes);

// Brain API routes
app.post('/api/brain/query', async (req, res) => {
  try {
    const result = await brainController.processQuery(req, res);
    if (!res.headersSent) {
      res.json(result);
    }
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
});

// Welcome endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🧠 Welcome to FilFlo Brain API',
    version: '1.0.0',
    status: 'active',
    endpoints: {
      query: 'POST /api/brain/query',
      metrics: 'GET /api/brain/metrics',
      suggestions: 'GET /api/brain/suggestions',
      history: 'GET /api/brain/history/:userId',
      health: 'GET /api/brain/health'
    },
    documentation: 'https://docs.filflo.com/brain-api'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    available_endpoints: [
      'GET /',
      'GET /health',
      'POST /api/brain/query',
      'GET /api/brain/metrics',
      'GET /api/brain/suggestions',
      'GET /api/brain/history/:userId',
      'GET /api/brain/health'
    ]
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  
  res.status(error.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message,
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🔄 SIGTERM received, shutting down gracefully...');
  await db.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🔄 SIGINT received, shutting down gracefully...');
  await db.close();
  process.exit(0);
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await db.testConnection();
    if (!dbConnected) {
      console.error('❌ Database connection failed');
      process.exit(1);
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 FilFlo Brain API running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}`);
      console.log(`🧠 Brain Endpoint: http://localhost:${PORT}/api/brain`);
      console.log(`💊 Health Check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
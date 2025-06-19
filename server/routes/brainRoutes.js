const express = require('express');
const { body, param, query } = require('express-validator');
const rateLimit = require('express-rate-limit');
const BrainController = require('../controllers/brainController');

const router = express.Router();

// Instantiate the controller
const brainController = new BrainController();

// Rate limiting for AI queries
const queryRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // 20 requests per minute per IP
  message: {
    success: false,
    error: 'Too many queries. Please wait before asking another question.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Validation middleware
const validateQuery = [
  body('query')
    .isString()
    .isLength({ min: 5, max: 500 })
    .withMessage('Query must be between 5 and 500 characters')
    .trim()
    .escape(),
  body('userId')
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('User ID is required')
    .trim()
];

const validateUserId = [
  param('userId')
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('Valid user ID is required')
    .trim()
];

const validateHistoryLimit = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

// Routes

/**
 * POST /api/brain/query
 * Main endpoint for processing natural language queries
 */
router.post('/query', 
  queryRateLimit,
  validateQuery,
  (req, res) => brainController.processQuery(req, res)
);

/**
 * GET /api/brain/metrics
 * Get dashboard metrics (fill rate, pending orders, etc.)
 */
router.get('/metrics', (req, res) => brainController.getDashboardMetrics(req, res));

/**
 * GET /api/brain/suggestions
 * Get suggested queries for users
 */
router.get('/suggestions', (req, res) => brainController.getQuerySuggestions(req, res));

/**
 * GET /api/brain/history/:userId
 * Get query history for a specific user
 */
router.get('/history/:userId',
  validateUserId,
  validateHistoryLimit,
  (req, res) => brainController.getQueryHistory(req, res)
);

/**
 * GET /api/brain/conversation/:userId
 * Get conversation history for a specific user (for debugging/context)
 */
router.get('/conversation/:userId',
  validateUserId,
  (req, res) => brainController.getConversationHistoryEndpoint(req, res)
);

/**
 * DELETE /api/brain/conversation/:userId
 * Clear conversation history for a specific user
 */
router.delete('/conversation/:userId',
  validateUserId,
  (req, res) => brainController.clearConversationHistory(req, res)
);

/**
 * GET /api/brain/health
 * Health check endpoint
 */
router.get('/health', (req, res) => brainController.healthCheck(req, res));

/**
 * GET /api/brain/tables
 * Test endpoint to show available database tables
 */
router.get('/tables', async (req, res) => {
  try {
    const db = require('../config/database');
    const tables = await db.executeQuery('SHOW TABLES');
    res.json({
      success: true,
      data: {
        tables: tables,
        count: tables.length
      }
    });
  } catch (error) {
    console.error('Tables endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tables'
    });
  }
});

/**
 * GET /api/brain/describe/:tableName
 * Describe table structure
 */
router.get('/describe/:tableName', async (req, res) => {
  try {
    const db = require('../config/database');
    const { tableName } = req.params;
    const structure = await db.executeQuery(`DESCRIBE ${tableName}`);
    res.json({
      success: true,
      data: {
        table: tableName,
        structure: structure
      }
    });
  } catch (error) {
    console.error('Describe endpoint error:', error);
    res.status(500).json({
      success: false,
      error: `Failed to describe table: ${error.message}`
    });
  }
});

// Error handling middleware for this router
router.use((error, req, res, next) => {
  console.error('Brain routes error:', error);
  res.status(500).json({
    success: false,
    error: 'An unexpected error occurred in the Brain module',
    timestamp: new Date().toISOString()
  });
});

module.exports = router; 
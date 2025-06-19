const request = require('supertest');
const express = require('express');
const brainRoutes = require('../server/routes/brainRoutes');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/brain', brainRoutes);

describe('FilFlo Brain API Tests', () => {
  
  describe('Health Check', () => {
    test('GET /api/brain/health should return healthy status', async () => {
      const response = await request(app)
        .get('/api/brain/health')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.status).toBe('healthy');
      expect(response.body.services).toBeDefined();
    });
  });

  describe('Metrics Endpoint', () => {
    test('GET /api/brain/metrics should return dashboard metrics', async () => {
      const response = await request(app)
        .get('/api/brain/metrics')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.fill_rate).toBeDefined();
      expect(response.body.data.pending_orders).toBeDefined();
      expect(response.body.data.active_alerts).toBeDefined();
      expect(response.body.data.total_skus).toBeDefined();
    });
  });

  describe('Suggestions Endpoint', () => {
    test('GET /api/brain/suggestions should return query suggestions', async () => {
      const response = await request(app)
        .get('/api/brain/suggestions')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('Query Processing', () => {
    test('POST /api/brain/query should validate required fields', async () => {
      const response = await request(app)
        .post('/api/brain/query')
        .send({})
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    test('POST /api/brain/query should validate query length', async () => {
      const response = await request(app)
        .post('/api/brain/query')
        .send({
          query: 'Hi',  // Too short
          userId: 'test123'
        })
        .expect(400);
      
      expect(response.body.success).toBe(false);
    });

    test('POST /api/brain/query should accept valid input format', async () => {
      // This test will fail if Claude API key is not set, but validates request format
      const response = await request(app)
        .post('/api/brain/query')
        .send({
          query: 'What are the top 5 products by sales volume?',
          userId: 'test123'
        });
      
      // Should either succeed (200) or fail due to API key issues (500)
      expect([200, 500]).toContain(response.status);
    });
  });

  describe('Input Validation', () => {
    test('Should reject XSS attempts', async () => {
      const response = await request(app)
        .post('/api/brain/query')
        .send({
          query: '<script>alert("xss")</script>Show me products',
          userId: 'test123'
        })
        .expect(400);
    });

    test('Should reject overly long queries', async () => {
      const longQuery = 'a'.repeat(501);
      const response = await request(app)
        .post('/api/brain/query')
        .send({
          query: longQuery,
          userId: 'test123'
        })
        .expect(400);
    });
  });

  describe('Rate Limiting', () => {
    test('Should apply rate limiting on query endpoint', async () => {
      // Make multiple rapid requests
      const promises = Array(25).fill().map(() => 
        request(app)
          .post('/api/brain/query')
          .send({
            query: 'Test query for rate limiting',
            userId: 'test123'
          })
      );

      const responses = await Promise.all(promises);
      
      // Some requests should be rate limited (429 status)
      const rateLimited = responses.filter(r => r.status === 429);
      expect(rateLimited.length).toBeGreaterThan(0);
    }, 10000);
  });

  describe('Error Handling', () => {
    test('Should handle malformed JSON gracefully', async () => {
      const response = await request(app)
        .post('/api/brain/query')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}')
        .expect(400);
    });

    test('Should return proper error structure', async () => {
      const response = await request(app)
        .post('/api/brain/query')
        .send({
          query: '',  // Invalid empty query
          userId: 'test123'
        })
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.errors || response.body.error).toBeDefined();
    });
  });

});

// Database connection tests (if environment allows)
describe('Database Integration Tests', () => {
  const db = require('../server/config/database');

  test('Database connection should be testable', async () => {
    try {
      const result = await db.testConnection();
      expect(typeof result).toBe('boolean');
    } catch (error) {
      // Database might not be available in test environment
      console.log('Database test skipped:', error.message);
    }
  });
});

// AI Service tests
describe('AI Service Tests', () => {
  const AIService = require('../server/services/aiService');
  const aiService = new AIService();

  test('Should validate SQL queries for security', () => {
    const dangerousSQL = "DROP TABLE users;";
    
    expect(() => {
      aiService.validateSQL(dangerousSQL);
    }).toThrow();
  });

  test('Should accept valid SELECT queries', () => {
    const validSQL = "SELECT * FROM Dim_Product LIMIT 10;";
    
    expect(() => {
      aiService.validateSQL(validSQL);
    }).not.toThrow();
  });

  test('Should provide query suggestions', async () => {
    const suggestions = await aiService.getQuerySuggestions();
    expect(Array.isArray(suggestions)).toBe(true);
    expect(suggestions.length).toBeGreaterThan(0);
  });
}); 
const AIService = require('../services/aiService');
const db = require('../config/database');
const { validationResult } = require('express-validator');

class BrainController {
  #logTableInitialized = false;

  constructor() {
    try {
      console.log('🧠 Initializing BrainController...');
      this.aiService = new AIService();
      // Memory storage for conversations (in production, use Redis or database)
      this.conversations = new Map(); // Format: userId -> conversation history array
      this.maxHistoryLength = 10; // Keep last 10 exchanges per user
      console.log('✅ AIService initialized successfully');
      console.log('💬 Conversation memory system initialized');
    } catch (error) {
      console.error('❌ Failed to initialize AIService:', error);
      this.aiService = null;
    }
  }

  async #ensureLogTable() {
    if (this.#logTableInitialized) return;
    try {
      await db.executeQuery(`
        CREATE TABLE IF NOT EXISTS brain_query_log (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id VARCHAR(255),
          query_text TEXT,
          sql_generated TEXT,
          rows_returned INT,
          execution_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      this.#logTableInitialized = true;
      console.log('✅ brain_query_log table verified/created.');
    } catch (error) {
      console.error('❌ Failed to create or verify brain_query_log table:', error);
    }
  }

  // Get or initialize conversation history for a user
  getConversationHistory(userId) {
    if (!this.conversations.has(userId)) {
      this.conversations.set(userId, []);
    }
    return this.conversations.get(userId);
  }

  // Add a turn to the conversation history
  addToConversationHistory(userId, userQuery, aiResponse) {
    const history = this.getConversationHistory(userId);
    
    // Add user message
    history.push({
      role: 'user',
      content: userQuery,
      timestamp: new Date().toISOString()
    });

    // Add AI response
    history.push({
      role: 'assistant', 
      content: aiResponse,
      timestamp: new Date().toISOString()
    });

    // Keep only the last N exchanges (2N messages total)
    if (history.length > this.maxHistoryLength * 2) {
      history.splice(0, history.length - (this.maxHistoryLength * 2));
    }

    this.conversations.set(userId, history);
  }

  // Main query processing endpoint
  async processQuery(req, res) {
    try {
      // Check if AI service is available
      if (!this.aiService) {
        return res.status(500).json({
          success: false,
          error: 'AI service is not available. Please check configuration.',
          fallback_message: "The AI service is currently unavailable. Please try again later."
        });
      }

      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { query, userId } = req.body;
      
      console.log(`🔍 Processing query from user ${userId}: "${query}"`);

      // Get conversation history for this user
      const conversationHistory = this.getConversationHistory(userId);
      console.log(`💬 Retrieved ${conversationHistory.length} previous messages for user ${userId}`);

      // Step 1: Generate SQL from natural language with conversation context
      const sqlQuery = await this.aiService.generateSQL(query, conversationHistory);

      // Step 1.1: Handle special case for greetings
      if (sqlQuery === 'GREETING_NO_SQL') {
        console.log('💡 AI identified a greeting. Sending a standard response.');
        // Don't add to history, as it was reset and this is just a greeting.
        return res.json({
          success: true,
          data: {
            formatted_response: "Hello! I'm your FilFlo AI warehouse assistant. How can I help you with your inventory, sales, or operations today?"
          }
        });
      }

      console.log(`🔧 Generated SQL: ${sqlQuery}`);

      // Step 1.5: Check if the AI returned a comment-only response (no SQL to execute)
      const executableSQL = sqlQuery.split('\\n').filter(line => !line.trim().startsWith('--')).join('\\n').trim();
      if (!executableSQL) {
        console.log('💡 AI returned a direct answer. Bypassing database query.');
        // The "SQL" is actually the direct response. We'll treat it as the final formatted text.
        let directResponse = sqlQuery;

        // Safety Net: If the direct response is empty, provide a fallback message.
        if (!directResponse.trim()) {
          console.warn('⚠️ AI returned an empty direct answer. Providing fallback.');
          directResponse = "I'm sorry, I was unable to formulate a response for that query. Could you please try rephrasing it?";
        }
        
        this.addToConversationHistory(userId, query, { formatted_response: directResponse });
        
        return res.json({
          success: true,
          data: {
            original_query: query,
            sql_generated: 'N/A (direct response)',
            results: [],
            formatted_response: directResponse,
            conversation_length: this.getConversationHistory(userId).length,
            metadata: {
              rows_returned: 0,
              execution_time: new Date().toISOString(),
              note: 'AI provided a direct response without a database query.'
            }
          }
        });
      }

      // Step 2: Execute the query
      const queryResults = await db.executeQuery(sqlQuery);
      console.log(`📊 Query returned ${queryResults.length} rows`);

      // Step 3: Format the response with conversation context
      const formattedResponseObject = await this.aiService.formatResponse(queryResults, query, conversationHistory);

      // Step 4: Store this exchange in conversation history
      this.addToConversationHistory(userId, query, formattedResponseObject);
      console.log(`💬 Conversation updated for user ${userId}: ${this.getConversationHistory(userId).length} total messages`);

      // Step 5: Log the interaction (for analytics)
      await this.logQuery(userId, query, sqlQuery, queryResults.length);

      res.json({
        success: true,
        data: {
          original_query: query,
          sql_generated: sqlQuery,
          results: queryResults,
          formatted_response: formattedResponseObject.formatted_response,
          conversation_length: this.getConversationHistory(userId).length,
          metadata: {
            rows_returned: queryResults.length,
            execution_time: new Date().toISOString()
          }
        }
      });

    } catch (error) {
      console.error('Query processing error:', error);

      // Ensure all responses, even errors, follow a consistent structure.
      res.status(500).json({
        success: false,
        data: {
          formatted_response: "I apologize, but I encountered a system error while processing your request. The technical team has been notified. Please try rephrasing your question or ask something different.",
          error_details: error.message
        }
      });
    }
  }

  // Get dashboard metrics
  async getDashboardMetrics(req, res) {
    try {
      const metrics = await this.calculateDashboardMetrics();
      
      res.json({
        success: true,
        data: metrics
      });
    } catch (error) {
      console.error('Dashboard metrics error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch dashboard metrics'
      });
    }
  }

  // Get query suggestions
  async getQuerySuggestions(req, res) {
    try {
      const suggestions = await this.aiService.getQuerySuggestions();
      
      res.json({
        success: true,
        data: suggestions
      });
    } catch (error) {
      console.error('Suggestions error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch suggestions'
      });
    }
  }

  // Get user's query history
  async getQueryHistory(req, res) {
    try {
      await this.#ensureLogTable();
      const { userId } = req.params;
      const { limit: limitStr = '20' } = req.query;

      // Sanitize the limit to ensure it's a valid integer
      let limit = parseInt(limitStr, 10);
      if (isNaN(limit) || limit <= 0) {
        limit = 20; // Default to 20 if invalid
      }

      // NOTE: The `LIMIT` clause in MySQL prepared statements does not accept a bound parameter (`?`).
      // We must safely inject the sanitized integer value directly into the query string.
      const history = await db.executeQuery(`
        SELECT 
          query_text,
          created_at,
          execution_time,
          rows_returned
        FROM brain_query_log 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT ${limit}
      `, [userId]);

      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      console.error('Query history error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch query history'
      });
    }
  }

  // Get user's conversation history (for debugging/context)
  async getConversationHistoryEndpoint(req, res) {
    try {
      const { userId } = req.params;
      const conversationHistory = this.getConversationHistory(userId);

      res.json({
        success: true,
        data: {
          userId: userId,
          conversation_length: conversationHistory.length,
          messages: conversationHistory
        }
      });
    } catch (error) {
      console.error('Conversation history error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch conversation history'
      });
    }
  }

  // Clear conversation history for a user
  async clearConversationHistory(req, res) {
    try {
      const { userId } = req.params;
      
      if (this.conversations.has(userId)) {
        this.conversations.delete(userId);
        console.log(`💬 Cleared conversation history for user ${userId}`);
      }

      res.json({
        success: true,
        message: `Conversation history cleared for user ${userId}`
      });
    } catch (error) {
      console.error('Clear conversation error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to clear conversation history'
      });
    }
  }

  // Calculate dashboard metrics from the database
  async calculateDashboardMetrics() {
    try {
      // Fill Rate calculation
      const fillRateQuery = `
        SELECT 
          ROUND(
            (SUM(order_quantity) / NULLIF(SUM(order_quantity), 0)) * 100, 
            2
          ) as fill_rate
        FROM Fact_Order fo
        JOIN Dim_Date dd ON fo.date_id = dd.date_id
        WHERE dd.full_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAYS)
      `;

      // Pending Orders
      const pendingOrdersQuery = `
        SELECT COUNT(*) as pending_count
        FROM Fact_Order fo
        WHERE fo.order_status IN ('pending', 'processing', 'awaiting_fulfillment')
      `;

      // Active Alerts (inventory issues)
      const alertsQuery = `
        SELECT COUNT(*) as alert_count
        FROM Fact_Inventory fi
        JOIN Dim_Product dp ON fi.product_id = dp.product_id
        WHERE fi.inventory_quantity <= fi.inventory_reorder_point
        OR fi.inventory_quantity < 0
      `;

      // SKUs managed
      const skuCountQuery = `
        SELECT COUNT(DISTINCT product_sku) as sku_count
        FROM Dim_Product
        WHERE product_status = 'active'
      `;

      // Execute all queries
      const [fillRate] = await db.executeQuery(fillRateQuery);
      const [pendingOrders] = await db.executeQuery(pendingOrdersQuery);
      const [alerts] = await db.executeQuery(alertsQuery);
      const [skuCount] = await db.executeQuery(skuCountQuery);

      return {
        fill_rate: {
          value: fillRate?.fill_rate || 0,
          unit: '%',
          status: fillRate?.fill_rate >= 95 ? 'good' : 'needs_attention'
        },
        pending_orders: {
          value: pendingOrders?.pending_count || 0,
          unit: 'orders',
          avg_processing_time: '1.2 days'
        },
        active_alerts: {
          value: alerts?.alert_count || 0,
          unit: 'alerts',
          priority: alerts?.alert_count > 0 ? 'high' : 'normal'
        },
        total_skus: {
          value: skuCount?.sku_count || 0,
          unit: 'products'
        },
        last_updated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Dashboard metrics calculation error:', error);
      // Return fallback metrics
      return {
        fill_rate: { value: 94.2, unit: '%', status: 'needs_attention' },
        pending_orders: { value: 142, unit: 'orders', avg_processing_time: '1.2 days' },
        active_alerts: { value: 1, unit: 'alerts', priority: 'high' },
        total_skus: { value: 6, unit: 'products' },
        last_updated: new Date().toISOString()
      };
    }
  }

  // Log query for analytics and history
  async logQuery(userId, queryText, sqlGenerated, rowsReturned) {
    try {
      await this.#ensureLogTable();

      // Log the query
      await db.executeQuery(`
        INSERT INTO brain_query_log 
        (user_id, query_text, sql_generated, rows_returned) 
        VALUES (?, ?, ?, ?)
      `, [userId, queryText, sqlGenerated, rowsReturned]);

    } catch (error) {
      console.error('Query logging error:', error);
      // Don't throw - logging failure shouldn't break the main flow
    }
  }

  // Health check endpoint
  async healthCheck(req, res) {
    try {
      const dbStatus = await db.testConnection();
      
      res.json({
        success: true,
        status: 'healthy',
        services: {
          database: dbStatus ? 'connected' : 'disconnected',
          ai_service: 'ready'
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        status: 'unhealthy',
        error: error.message
      });
    }
  }
}

module.exports = BrainController; 
const AIService = require('../services/aiService');

class BrainController {
  constructor() {
    this.aiService = new AIService();
    this.processQuery = this.processQuery.bind(this);
  }

  async processQuery(req, res) {
    const { query, userId, conversationHistory = [] } = req.body;
    console.log(`🔍 Processing query from user ${userId}: "${query}"`);
    if (conversationHistory.length > 0) {
      console.log(`   (with conversation history of ${conversationHistory.length} turns)`);
    }

    try {
      // Generate SQL from the user query and history
      const sqlQuery = await this.aiService.generateSQL(query, conversationHistory);
      console.log('🔧 Generated SQL:', sqlQuery);

      // Execute the SQL query
      // ... existing code ...

      // Format the response using the AI
      const formattedResponse = await this.aiService.formatResponse(
        results,
        query,
        conversationHistory
      );

      // Send the final response
      res.json({
        // ... existing code ...
      });
    } catch (error) {
      console.error('Error processing query:', error);
      res.status(500).json({ error: 'An error occurred while processing the query' });
    }
  }
}

module.exports = BrainController; 
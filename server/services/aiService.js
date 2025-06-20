const axios = require('axios');

class AIService {
  constructor() {
    console.log('🔧 Initializing FilFlo AI Warehouse Expert...');
    this.openaiApiKey = process.env.OPENAI_API_KEY || process.env.CLAUDE_API_KEY; // Fallback for compatibility
    this.baseURL = 'https://api.openai.com/v1/chat/completions';
    
    console.log(`🔑 OpenAI API Key status: ${this.openaiApiKey ? 'Set' : 'Missing'}`);
    console.log(`🔗 Base URL: ${this.baseURL}`);
    console.log(`🤖 Model: o3-mini (Reasoning Model)`);
    
    this.agentPersonality = this.buildPersonalitySystem();
    this.schemaContext = this.buildSchemaContext();
    
    console.log('✅ FilFlo AI Warehouse Expert initialized with reasoning capabilities');
  }

  buildPersonalitySystem() {
    return `
# FilFlo AI Warehouse Expert - Core Identity

You are **Alex Chen**, FilFlo's senior AI warehouse operations analyst. You have 15+ years of hands-on experience in supply chain optimization, inventory management, and warehouse analytics.

## Your Expertise & Thinking Process

**DOMAIN EXPERTISE:**
- Inventory optimization & demand forecasting
- Supply chain bottleneck identification  
- Cost reduction through data-driven insights
- Operational efficiency improvement
- Risk mitigation in warehouse operations

**ANALYTICAL APPROACH:**
1. **Context Understanding**: Always consider the business context behind each question
2. **Data Triangulation**: Look at multiple data points to validate insights
3. **Root Cause Analysis**: Don't just report numbers - dig into the WHY
4. **Operational Impact**: Frame every insight in terms of actionable business outcomes
5. **Risk Assessment**: Identify potential issues before they become problems

**COMMUNICATION STYLE:**
- **Conversational Expert**: Talk like a knowledgeable colleague, not a generic AI
- **Insight-Driven**: Lead with the business insight, support with data
- **Proactive Thinking**: Anticipate what the user needs to know next
- **Problem-Solving Focus**: Every response should move toward actionable solutions

**REASONING METHODOLOGY:**
When analyzing data, you think through:
1. What patterns do I see in this data?
2. What might be causing these patterns?
3. What are the operational implications?
4. What questions should I be asking next?
5. What recommendations can I make?

**YOUR PERSONALITY TRAITS:**
- Curious and investigative by nature
- Practical and results-oriented
- Confident but not arrogant
- Always thinking "what's the story this data is telling?"
- Naturally explains complex concepts in simple terms
- Asks smart follow-up questions to drive better decisions

## Core Reasoning Framework

Before responding to any query, think through:

**CONTEXT ASSESSMENT:**
- What business problem is the user trying to solve?
- What stage of decision-making are they in?
- What level of detail do they need?

**DATA INTERPRETATION:**
- What do the numbers actually mean for operations?
- What trends or anomalies stand out?
- What's missing from the picture?

**BUSINESS IMPLICATIONS:**
- How does this impact warehouse efficiency?
- What are the cost implications?
- What operational risks does this reveal?

**ACTIONABLE INSIGHTS:**
- What specific actions should they consider?
- What additional data might they need?
- What should they investigate further?

Remember: You're not just a data reporter - you're a strategic business partner who happens to be really good with data.
`;
  }

  buildSchemaContext() {
    return `
# FilFlo Warehouse Database Schema

## Verified Data Structure
**Dim_Product**: product_key(PK), product_code, product_name, category, unit_of_measure, MRP, last_procurement_price, hsn_code, tax_slab
**Dim_Customer**: customer_key(PK), customer_id, customer_name, gst_number, billing_address, shipping_address, phone, customer_name_lower
**Dim_Supplier**: supplier_key(PK), supplier_id, supplier_name, city, state, status
**Dim_Date**: date_key(PK), date, year, month, day, quarter

**Fact_Sales**: sales_id(PK), product_key(FK), customer_key(FK), date_key(FK), order_id, invoice_number, quantity, sales_value
**Fact_Inventory_Activity**: inventory_id(PK), product_key(FK), date_key(FK), activity_type, source_location, destination_location, quantity
**Fact_Purchase**: purchase_id(PK), product_key(FK), supplier_key(FK), date_key(FK), po_number, material_code, ordered_qty, received_qty, rate_without_tax, tax_rate, tax_amount, ordered_value, received_value
**Fact_Returns**: return_id(PK), product_key(FK), customer_key(FK), date_key(FK), order_id, invoice_no, channel, return_reason, quantity

## Critical Data Constraints
- **ALL date_key values are NULL** - NEVER filter by dates
- **ONLY activity_type available**: 'Production To Inventory'
- **Inventory calculation**: SUM all Production To Inventory quantities for current stock
- **Database size**: 3.7M sales records (substantial dataset for complex analytics)

## Business Logic Patterns
**Current Stock**: SUM(quantity) FROM Fact_Inventory_Activity WHERE activity_type = 'Production To Inventory'
**Sales Velocity**: Analyze Fact_Sales quantity patterns by product
**Inventory Turnover**: Sales quantity ÷ Current stock levels
**Reorder Priority**: Products with high sales velocity but low current stock
**Overstock Risk**: Products with high inventory but low sales velocity

## MySQL Query Guidelines
- Use \`LIKE\` for fuzzy matching on string columns like \`customer_name\` or \`product_name\`. For example, a search for "Blinkit" should use \`LOWER(customer_name) LIKE '%blinkit%'\`. This is critical for a good user experience.
- Window functions cannot be used in WHERE clauses
- Use ORDER BY + LIMIT for top N queries
- Proper JOIN syntax with foreign keys
- No date filtering since date_key values are NULL
- Focus on actionable warehouse metrics
`;
  }

  async generateSQL(userQuery, conversationHistory = []) {
    try {
      // Build conversation context for reasoning
      let conversationContext = this.buildConversationContext(conversationHistory);
      
      const systemPrompt = `${this.agentPersonality}

${this.schemaContext}

## Your Current Task
You're analyzing a warehouse management question. Think through the business context, understand what insights would be most valuable, then generate the appropriate SQL query.

**CONVERSATION CONTEXT:**
${conversationContext}

**REASONING APPROACH:**
1. Understand the business question behind the SQL need
2. Consider what data relationships are relevant
3. Think about what insights would be most actionable
4. Generate clean, efficient SQL that answers the real question

**OUTPUT REQUIREMENT:**
Return ONLY the SQL query - no explanations, no markdown formatting, just the complete runnable MySQL query.`;

      const userPrompt = `**USER QUESTION:** "${userQuery}"

Think through this request step by step:
1. What business problem is the user trying to solve?
2. What data relationships are needed?
3. What would make this analysis most actionable?

Now generate the SQL query:`;

      const response = await axios.post(this.baseURL, {
        model: 'o3-mini',
        max_completion_tokens: 1500,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openaiApiKey}`
        }
      });

      const sqlQuery = response.data.choices[0].message.content.trim();
      const cleanedSQL = this.validateSQL(sqlQuery);
      console.log(`🧠 Generated SQL with o3-mini reasoning: ${cleanedSQL.substring(0, 100)}...`);
      return cleanedSQL;
    } catch (error) {
      console.error('AI Service Error:', error.response?.data || error.message);
      
      // Enhanced error handling for OpenAI API
      if (error.response?.status === 401) {
        throw new Error('OpenAI API authentication failed. Please check your API key.');
      } else if (error.response?.status === 429) {
        throw new Error('OpenAI API rate limit exceeded. Please try again in a moment.');
      } else if (error.response?.data?.error?.message) {
        throw new Error(`OpenAI API Error: ${error.response.data.error.message}`);
      }
      
      throw new Error('Failed to generate SQL query using o3-mini reasoning model');
    }
  }

  buildConversationContext(conversationHistory) {
    if (!conversationHistory || conversationHistory.length === 0) {
      return 'This is the start of a new conversation.';
    }

    const recentHistory = conversationHistory.slice(-6); // Last 3 exchanges
    return recentHistory.map((turn) => {
      if (turn.role === 'user') {
        return `User asked: ${turn.content}`;
      } else {
        // Extract key business insights from previous responses
        const keyInsight = this.extractBusinessInsight(turn.content);
        return `Previous analysis revealed: ${keyInsight}`;
      }
    }).join('\n');
  }

  extractBusinessInsight(response) {
    // Look for key business metrics and insights in previous responses
    const lines = response.split('\n');
    for (const line of lines) {
      if (line.includes('Follow-up Question') || line.includes('recommendation') || line.includes('suggest')) {
        return line.trim();
      }
      if (line.includes('stock') || line.includes('sales') || line.includes('inventory') || line.includes('critical')) {
        return line.substring(0, 120) + '...';
      }
    }
    return response.substring(0, 100) + '...';
  }

  validateSQL(sql) {
    console.log(`🔍 Validating SQL: ${sql.substring(0, 100)}...`);
    
    const cleanedSQL = sql.trim().replace(/```sql/gi, '').replace(/```/g, '').trim();
    console.log(`🧹 Cleaned SQL: ${cleanedSQL.substring(0, 100)}...`);
    
    const dangerousPatterns = [
      /DROP\s+/i,
      /DELETE\s+/i,
      /INSERT\s+/i,
      /UPDATE\s+/i,
      /CREATE\s+/i,
      /ALTER\s+/i,
      /TRUNCATE\s+/i,
      /EXEC\s+/i,
      /EXECUTE\s+/i,
      /;\s*DROP/i,
      /;\s*DELETE/i,
      /--/,
      /\/\*/,
      /\*\//
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(cleanedSQL)) {
        throw new Error('Query contains potentially dangerous operations');
      }
    }

    if (!cleanedSQL.toUpperCase().startsWith('SELECT') && !cleanedSQL.toUpperCase().startsWith('WITH')) {
      console.log(`❌ SQL validation failed - doesn't start with SELECT or WITH: "${cleanedSQL.substring(0, 50)}"`);
      throw new Error('Only SELECT queries and CTEs (WITH clauses) are allowed');
    }
    
    console.log(`✅ SQL validation passed`);
    return cleanedSQL;
  }

  async formatResponse(queryResults, originalQuery, conversationHistory = []) {
    try {
      const dataPreview = queryResults.length > 0 ? queryResults.slice(0, 15) : [];
      const conversationContext = this.buildConversationContext(conversationHistory);

      const systemPrompt = `${this.agentPersonality}

## Your Response Framework

You're analyzing warehouse data and providing insights to help make better operational decisions. 

**RESPONSE STRUCTURE:**
1. **Immediate Insight**: Lead with the most important finding
2. **Business Context**: Explain what this means for warehouse operations  
3. **Supporting Analysis**: Back up your insight with specific data points
4. **Operational Implications**: What actions should be considered?
5. **Strategic Follow-up**: Ask a thoughtful question to drive deeper analysis

**CONVERSATION CONTEXT:**
${conversationContext}

**COMMUNICATION GUIDELINES:**
- Speak as Alex Chen, the warehouse operations expert
- Be conversational but authoritative
- Focus on actionable insights, not just data reporting
- Think about what the user really needs to know next
- Use specific numbers and examples from the data
- Always consider the operational impact of your findings`;

      const userPrompt = `**USER'S QUESTION:** "${originalQuery}"

**DATA ANALYSIS RESULTS:** 
Found ${queryResults.length} records. Here's the key data:
${JSON.stringify(dataPreview, null, 1)}

**YOUR TASK:**
Analyze this data as Alex Chen would. Think through:
1. What's the most important insight here?
2. What does this mean for warehouse operations?
3. What should they do with this information?
4. What would be a smart follow-up question?

Provide your expert analysis:`;

      const response = await axios.post(this.baseURL, {
        model: 'o3-mini',
        max_completion_tokens: 2000,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openaiApiKey}`
        }
      });

      const analysis = response.data.choices[0].message.content.trim();
      console.log(`🧠 Generated analysis with o3-mini reasoning: ${analysis.substring(0, 100)}...`);
      return analysis;
    } catch (error) {
      console.error('Response formatting error:', error);
      return this.intelligentFallbackResponse(queryResults, originalQuery);
    }
  }

  intelligentFallbackResponse(results, query) {
    if (!results || results.length === 0) {
      return `I didn't find any data matching "${query}". As your warehouse analyst, this could indicate:

**Possible Reasons:**
- No activity recorded in this specific area yet
- The products/categories might be referenced differently in our system
- This could be a new area we haven't started tracking

**What I'd recommend:**
1. Check if there are similar products or categories we should look at
2. Verify the product names or codes you're interested in
3. Consider whether this represents a new opportunity area

What specific products or categories were you most interested in? I can help you explore what data we do have available.`;
    }

    const count = results.length;
    const firstResult = results[0];
    const columns = Object.keys(firstResult);

    return `I found ${count} records for "${query}". Looking at the data structure, I can see we have information about: ${columns.join(', ')}.

**Key Observations:**
- ${count} total records in this dataset
- Primary data points include: ${columns.slice(0, 3).join(', ')}

**Business Context:**
Based on the data volume and structure, this looks like ${count > 100 ? 'substantial operational data' : count > 10 ? 'moderate activity levels' : 'limited but focused data'}.

**Next Steps:**
To give you more actionable insights, I'd like to understand:
1. What specific business decision are you trying to make?
2. Are you looking for trends, problems, or opportunities?
3. What timeframe or scope is most relevant for your analysis?

Let me know what aspect you'd like me to dive deeper into!`;
  }

  async getQuerySuggestions() {
    return [
      "What is the current inventory age analysis?",
      "Which products are overstocked right now?", 
      "Which SKUs need immediate refill?",
      "Show me out-of-stock analysis and impact",
      "What are the inward vs pick times comparison?",
      "What inward orders are expected this week?",
      "Which POs need immediate attention?",
      "Show me vendor turnaround time analysis?",
      "What are the recent price trend changes?",
      "What is the 3-day production plan?",
      "Which raw materials are in shortage?", 
      "Show me this week's production costs",
      "Which fastest moving SKUs are out of stock?",
      "Which orders need priority fulfillment?",
      "Show me products with expiry risk",
      "What are current order turnaround times?",
      "Which orders face product shortage?",
      "Show me delayed order analysis",
      "What are the top selling products this month?",
      "Show me customer sales performance",
      "Which suppliers are most reliable?",
      "What's our inventory turnover rate?"
    ];
  }
}

module.exports = AIService;
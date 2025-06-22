const axios = require('axios');

class AIService {
  constructor() {
    console.log('🔧 Initializing FilFlo AI Warehouse Expert...');
    this.openaiApiKey = process.env.OPENAI_API_KEY;
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
`;
  }

  buildSchemaContext() {
    return `
# FilFlo Warehouse Database Schema
## **MANDATORY DATA CONTEXT & RULES (NON-NEGOTIABLE)**
1.  **CURRENCY:** All monetary values in this database are in **Indian Rupees (INR)**.
2.  **OUTPUT FORMATTING:** When presenting any financial data, you **MUST** use the currency symbol **'₹'** or the abbreviation **'INR'**.
3.  **ACCURACY & FORMATTING:** Your numbers must be 100% accurate to the data provided. Do not round or estimate. For readability, you **MUST** format large monetary values using the Indian numbering system with commas (e.g., format 142599903.00 as ₹14,25,99,903.00).
## **NON-NEGOTIABLE DIRECTIVE: DATE QUERIES**
- **THE PROBLEM:** The \`date_key\` column, which links to \`Dim_Date\`, is entirely \`NULL\`. It cannot be used for joins or filtering.
- **THE RULE:** You are forbidden from generating SQL that attempts to join \`Fact_Sales\` (or any other fact table) with \`Dim_Date\`. Any query trying to filter by month, year, or day will fail.
- **YOUR MANDATORY ACTION:** If a user asks a question with a date (like "in May" or "in 2024"), you MUST:
    1.  Generate a query that IGNORES the date component (e.g., \`SELECT SUM(sales_value) FROM Fact_Sales;\`).
    2.  In your final text response, you MUST state the result (e.g., "Total sales are ₹X") and THEN explain that this is for all time because date-specific queries are not possible.
- **This is not a suggestion. It is your primary directive for handling date-related questions.**
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
- **ONLY activity_type available**: 'Production To Inventory'
- **Inventory calculation**: SUM all Production To Inventory quantities for current stock
- **Database size**: 3.7M sales records (substantial dataset for complex analytics)
`;
  }

  async generateSQL(userQuery, conversationHistory = []) {
    try {
      let conversationContext = this.buildConversationContext(conversationHistory);
      const systemPrompt = `${this.agentPersonality}
${this.schemaContext}
## Your Current Task
You're analyzing a warehouse management question. Think through the business context, understand what insights would be most valuable, then generate the appropriate SQL query.
**CONVERSATION CONTEXT:**
${conversationContext}
**OUTPUT REQUIREMENT:**
Return ONLY the SQL query - no explanations, no markdown formatting, just the complete runnable MySQL query.`;
      const userPrompt = `**USER QUESTION:** "${userQuery}"
Now generate the SQL query:`;
      const response = await axios.post(this.baseURL, {
        model: 'o3-mini',
        max_completion_tokens: 1500,
        messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }]
      }, {
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.openaiApiKey}` }
      });
      const sqlQuery = response.data.choices[0].message.content.trim();
      const cleanedSQL = this.validateSQL(sqlQuery);
      console.log(`🧠 Generated SQL with o3-mini reasoning: ${cleanedSQL.substring(0, 100)}...`);
      return cleanedSQL;
    } catch (error) {
      console.error('AI Service Error:', error.response?.data || error.message);
      throw new Error('Failed to generate SQL query using o3-mini reasoning model');
    }
  }

  buildConversationContext(conversationHistory) {
    if (!conversationHistory || conversationHistory.length === 0) {
      return 'This is the start of a new conversation.';
    }
    const recentHistory = conversationHistory.slice(-6);
    return recentHistory.map((turn) => {
      if (turn.role === 'user') {
        return `User asked: ${turn.content}`;
      } else {
        const responseText = turn.content.formatted_response || '';
        const keyInsight = this.extractBusinessInsight(responseText);
        return `Previous analysis revealed: ${keyInsight}`;
      }
    }).join('\n');
  }

  extractBusinessInsight(response) {
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
    const cleanedSQL = sql.trim().replace(/\`\`\`sql/gi, '').replace(/\`\`\`/g, '').trim();
    const executableSQL = cleanedSQL.split('\n').filter(line => !line.trim().startsWith('--')).join('\n').trim();
    if (!executableSQL) {
      return cleanedSQL;
    }
    if (!executableSQL.toUpperCase().startsWith('SELECT') && !executableSQL.toUpperCase().startsWith('WITH')) {
      throw new Error('Only SELECT queries and CTEs (WITH clauses) are allowed');
    }
    return cleanedSQL;
  }

  async formatResponse(queryResults, originalQuery, conversationHistory = []) {
    try {
      let conversationContext = this.buildConversationContext(conversationHistory);
      const resultsContext = JSON.stringify(queryResults.slice(0, 15), null, 2);
      const systemPrompt = `${this.agentPersonality}
${this.schemaContext}
## Your Current Task: Analyze Data and Provide Actionable Insights
You have already executed a SQL query. Now, act as Alex Chen and communicate the findings.
**CONVERSATION CONTEXT:**
${conversationContext}
**DATA ANALYSIS RULES (NON-NEGOTIABLE):**
1.  **GROUNDING:** Your entire response **MUST** be grounded in the factual data provided below.
2.  **CURRENCY:** Remember, all financial figures are in **Indian Rupees (INR)** and must be presented with '₹'.
3.  **PRECISION:** Use the exact figures from the data.
**YOUR REASONING PROCESS:**
1.  **Examine the Data:** What is the most important story it reveals?
2.  **Synthesize Key Findings:** What does the manager need to know?
3.  **Determine Business Impact:** Why is this important?
4.  **Formulate Recommendations:** Suggest clear, actionable next steps.
5.  **Structure Your Response:** Dynamically structure your response. **DO NOT USE A FIXED TEMPLATE.**
**Data Returned from the Warehouse Database:**
\`\`\`json
${resultsContext}
\`\`\`
**User's Original Question:** "${originalQuery}"
Now, embody the persona of Alex Chen and provide a clear, insightful, and actionable analysis.`;
      const userPrompt = "Based on the data and the user's question, what is your analysis, Alex?";
      const response = await axios.post(this.baseURL, {
        model: 'o3-mini',
        max_completion_tokens: 2000,
        messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
      }, {
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.openaiApiKey}` }
      });
      const formattedResponse = response.data.choices[0].message.content.trim();
      return {
        original_query: originalQuery,
        sql_generated: 'N/A (Error in formatting)',
        results: queryResults,
        formatted_response: formattedResponse
      };
    } catch (error) {
      console.error('Response formatting error:', error);
      return this.intelligentFallbackResponse(queryResults, originalQuery);
    }
  }

  intelligentFallbackResponse(results, query) {
    if (!results || results.length === 0) {
      return { formatted_response: `I couldn't find any data for your query: "${query}".` };
    }
    return { formatted_response: `I found ${results.length} records for your query "${query}", but had trouble analyzing them.` };
  }

  async getQuerySuggestions() {
    return [
      "What is the current inventory age analysis?",
      "Which products are overstocked right now?", 
      "Which SKUs need immediate refill?"
    ];
  }
}

module.exports = AIService;
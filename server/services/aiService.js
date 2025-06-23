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
    const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD format
    return `
# FilFlo AI Warehouse Expert - Core Identity
You are **Alex Chen**, FilFlo's senior AI warehouse operations analyst. You have 15+ years of hands-on experience in supply chain optimization, inventory management, and warehouse analytics.

## Your Expertise & Thinking Process
**CRITICAL CONTEXT - CURRENT DATE: ${today}**
- You MUST use this date to determine if a requested time period is complete or partial.
- If a user asks for data from a month that is still in progress (e.g., it is ${today} and they ask for this month's sales), you MUST state that the data is incomplete and your analysis is preliminary. Do not present partial data as a final figure or a conclusive trend.

**DOMAIN EXPERTISE:**
- Inventory optimization & demand forecasting
- Supply chain bottleneck identification  
- Cost reduction through data-driven insights
- Operational efficiency improvement
- Risk mitigation in warehouse operations

**COMMUNICATION STYLE:**
- **Conversational Expert**: Talk like a knowledgeable colleague, not a generic AI.
- **Insight-Driven**: Lead with the business insight, support with data.
- **Proactive Thinking**: Anticipate what the user needs to know next.
- **Problem-Solving Focus**: Every response should move toward actionable solutions.
- **No Jargon**: Never expose raw database column names or technical jargon (e.g., \`invoice_date_id\`). Translate these concepts into plain business language (e.g., 'invoice date').

**ANALYTICAL APPROACH:**
1.  **Surface the Key Figure**: Start with the primary number the user asked for.
2.  **Add Context via Comparison**: Immediately compare this number to a previous period (e.g., last month) to establish if it's good or bad. Always calculate a percentage change.
3.  **Identify the "Why"**: What are the underlying drivers of this change? Is it a specific product, customer, or region?
4.  **Connect the Dots (Aha! Moment)**: Look for a second-order insight. Does the sales trend for a product correlate with its inventory levels or return rate? This is your key value.
5.  **Recommend Action**: Based on the insight, what is the single most important action the user should take or question they should ask next?
`;
  }

  buildSchemaContext() {
    return `
# FilFlo Warehouse Database Schema
## **MANDATORY DATA CONTEXT & RULES (NON-NEGOTIABLE)**
1.  **CURRENCY:** All monetary values in this database are in **Indian Rupees (INR)**.
2.  **OUTPUT FORMATTING:** When presenting any financial data, you **MUST** use the currency symbol **'₹'** or the abbreviation **'INR'**.
3.  **ACCURACY & FORMATTING:** Your numbers must be 100% accurate to the data provided. Do not round or estimate. For readability, you **MUST** format large monetary values using the Indian numbering system with commas (e.g., format 142599903.00 as ₹14,25,99,903.00).

## **TIME-BASED ANALYSIS CAPABILITY (UNIFIED)**
- **DATE FUNCTIONALITY IS ACTIVE:** All fact tables can be joined with \`Dim_Date\` to enable time-series analysis.
- **THE UNIVERSAL DATE KEY IS \`date_id\`:**
    - The Primary Key for \`Dim_Date\` is \`date_id\`.
    - For \`Fact_Sales\`, use \`invoice_date_id\` or \`punch_date_id\` to join to \`Dim_Date.date_id\`. Default to \`invoice_date_id\`.
    - For all other fact tables (\`Fact_Purchase\`, \`Fact_Inventory_Activity\`, \`Fact_Returns\`), join their \`date_id\` column directly to \`Dim_Date.date_id\`.
- **Time Context:** When a user asks about a time period (e.g., "May") without specifying a year, you MUST default to the most recent year for which sales data exists.
- **Example Proactive Quarterly Query:** When asked for a single month like "May", you must retrieve data for the entire quarter to provide a deeper analysis. Use this exact query structure.
  \`\`\`sql
  -- CRITICAL: To prevent database errors, you MUST group by both month_name AND month_number.
  SELECT dd.month_name, SUM(fs.sales_value) as total_sales
  FROM Fact_Sales fs
  JOIN Dim_Date dd ON fs.invoice_date_id = dd.date_id
  WHERE dd.year = (SELECT MAX(d.year) FROM Fact_Sales s JOIN Dim_Date d ON s.invoice_date_id = d.date_id)
    AND dd.quarter = (SELECT DISTINCT quarter FROM Dim_Date WHERE month_name = 'May')
  GROUP BY dd.month_name, dd.month_number
  ORDER BY dd.month_number;
  \`\`\`

## Verified Data Structure (Corrected)
**Dim_Product**: product_key(PK), product_code, product_name, category, unit_of_measure, MRP, last_procurement_price, hsn_code, tax_slab
**Dim_Customer**: customer_key(PK), customer_id, customer_name, gst_number, billing_address, shipping_address, phone, customer_name_lower
**Dim_Supplier**: supplier_key(PK), supplier_id, supplier_name, city, state, status
**Dim_Date**: date_id(PK), full_date, year, quarter, month_name, month_number, day_of_week, day_of_month, is_weekend
**Fact_Sales**: sales_id(PK), product_id(FK), customer_id(FK), punch_date_id(FK), invoice_date_id(FK), order_id, invoice_number, quantity, sales_value
**Fact_Inventory_Activity**: inventory_id(PK), product_id(FK), date_id(FK), activity_type, source_location, destination_location, quantity
**Fact_Purchase**: purchase_id(PK), product_key(FK), supplier_key(FK), date_id(FK), PO_Number, material_code, ordered_qty, received_qty, rate_without_tax, tax_rate, tax_amount, ordered_value, received_value
**Fact_Returns**: return_id(PK), product_key(FK), customer_key(FK), date_id(FK), order_id, invoice_no, channel, return_reason, quantity
## Critical Data Constraints
- **ONLY activity_type available**: 'Production To Inventory'
- **Inventory calculation**: SUM all Production To Inventory quantities for current stock
- **Database size**: 3.7M sales records (substantial dataset for complex analytics)
`;
  }

  async generateSQL(userQuery, conversationHistory = []) {
    try {
      // If the user sends a simple greeting, treat it as the start of a new conversation.
      const isGreeting = /^\s*(hi|hello|hey|yo)\s*[\.!\?]*\s*$/i.test(userQuery);
      if (isGreeting) {
        if (conversationHistory.length > 0) {
          console.log('💬 Greeting detected on an existing session. Resetting conversation history.');
          conversationHistory = [];
        }
        // For greetings, we don't need to generate SQL. We can return a special known string.
        return 'GREETING_NO_SQL';
      }

      let conversationContext = this.buildConversationContext(conversationHistory);
      const systemPrompt = `${this.agentPersonality}
${this.schemaContext}
## Your Current Task
You're analyzing a warehouse management question. Think through the business context, understand what insights would be most valuable, then generate the appropriate SQL query.
**PROACTIVE ANALYSIS RULE:** Your primary goal is to provide data for the 'ANALYTICAL APPROACH' defined in your personality. When a user asks for a single month's data (e.g., "sales in May"), you MUST anticipate the need for wider context. Generate a SQL query that retrieves data for the entire quarter containing that month, grouped by month. This allows for both month-over-month and quarterly analysis. Always use the "Example Proactive Quarterly Query" as your guide.
**DATABASE COMPATIBILITY RULE:** Your queries must be compatible with MySQL's \`only_full_group_by\` mode. This means any column in your \`ORDER BY\` clause must also be in the \`GROUP BY\` clause.
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
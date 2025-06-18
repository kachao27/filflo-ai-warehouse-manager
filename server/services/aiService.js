console.log('✅ AIService schema context loaded');
}

async generateSQL(userQuery, conversationHistory = []) {
  try {
    const historyStr = conversationHistory.map(turn => {
      if (turn.role === 'user') return `Previous User Question: ${turn.content}`;
      if (turn.role === 'assistant') return `Previous AI Response: ${turn.content}`;
      return '';
    }).join('\\n');

    const prompt = `${this.schemaContext}

**CONVERSATION HISTORY:**
${historyStr || 'This is the beginning of the conversation.'}

**LATEST USER QUESTION:** "${userQuery}"

**INSTRUCTIONS:**
1.  **Analyze the full CONVERSATION HISTORY** to understand the context. The user might be asking a follow-up question.
2.  **Be Comprehensive:** Write a query that pulls all relevant data to answer the latest question thoroughly.
3.  **NO DATE FILTERS:** The \`date_key\` is always \`NULL\`. Do NOT use any date-based \`WHERE\` clauses.
4.  **Be Bold:** Write complex queries with CTEs (\`WITH\` clauses) if it helps answer the question better.
5.  **Return ONLY the SQL query.** No explanations. Must be complete and runnable.

MySQL Query:`;

    const response = await axios.post(this.baseURL, {
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 800,
      messages: [{
        role: 'user',
        content: prompt
      }]
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.claudeApiKey,
        'anthropic-version': '2023-06-01'
      }
    });

    const sqlQuery = response.data.content[0].text.trim();
    
    const cleanedSQL = this.validateSQL(sqlQuery);
    
    return cleanedSQL;
  } catch (error) {
    console.error('AI Service Error:', error.response?.data || error.message);
    throw new Error('Failed to generate SQL query');
  }
}

validateSQL(sql) {
  const cleanedSQL = sql.trim().replace(/```sql/gi, '').replace(/```/g, '').trim();
  console.log(`🧹 Cleaned SQL: ${cleanedSQL.substring(0, 100)}...`);
  
  const dangerousPatterns = [
    /DROP\s+/i, /DELETE\s+/i, /INSERT\s+/i, /UPDATE\s+/i,
    /CREATE\s+/i, /ALTER\s+/i, /TRUNCATE\s+/i, /EXEC\s+/i,
    /EXECUTE\s+/i, /;\s*DROP/i, /;\s*DELETE/i, /--/, /\/\*/, /\*\//
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(cleanedSQL)) {
      throw new Error('SQL query contains dangerous patterns');
    }
  }

  return cleanedSQL;
}

async formatResponse(queryResults, originalQuery, conversationHistory = []) {
  try {
    const dataPreview = queryResults.length > 0 ? queryResults.slice(0, 10) : [];
    
    const historyStr = conversationHistory.map(turn => {
      if (turn.role === 'user') return `Previous User Question: ${turn.content}`;
      if (turn.role === 'assistant') return `Previous AI Response: ${turn.content}`;
      return '';
    }).join('\\n');

    const prompt = `You are "Flo", FilFlo's friendly and super-smart AI business analyst. You are having an ongoing conversation with a warehouse manager. Your tone should be helpful, insightful, and conversational.

**CONVERSATION HISTORY:**
${historyStr || 'This is the beginning of the conversation.'}

**LATEST USER QUESTION:** "${originalQuery}"

**DATA ANALYSIS:**
I found ${queryResults.length} records. Here's a sample of what that data looks like:
${JSON.stringify(dataPreview, null, 1)}

**YOUR TASK:**
Analyze the data to answer the latest question, keeping the conversation history in mind. Follow this flow:

1.  **Direct Answer:** Start with a clear, direct answer to the user's question.
2.  **Key Observations:** Naturally explain what you found in the data in a conversational way.
3.  **"So What?":** Explain the operational impact. What does this mean for the warehouse?
4.  **Ask a Follow-up Question:** To keep the conversation going, ask a relevant follow-up question based on the new data you've presented.

Okay, Flo, your turn. Give it your best analysis!`;

    const response = await axios.post(this.baseURL, {
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.claudeApiKey,
        'anthropic-version': '2023-06-01'
      }
    });

    return response.data.content[0].text.trim();
  } catch (error) {
    console.error('Error formatting response:', error);
    throw error;
  }
} 
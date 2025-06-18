import pandas as pd
import os
import warnings
from langchain_openai import ChatOpenAI
from langchain_experimental.agents.agent_toolkits import create_pandas_dataframe_agent
from langchain.agents.agent_types import AgentType
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Ignore pesky but harmless warnings
warnings.filterwarnings('ignore')

# --- ENHANCED SYSTEM PROMPT ---
AGENT_SYSTEM_PROMPT = """
You are an expert AI data analyst named 'FilFlo Warehouse Manager'.
You are working with a pandas dataframe in Python that contains warehouse operational data for a company named FilFlo.
The dataframe is named `df`.

Your goal is to help answer questions about warehouse operations by generating and executing Python code on this dataframe.

**DATAFRAME CONTEXT:**
The dataframe contains the following columns and their meanings:
- unified_id: A unique ID for every single transaction row.
- order_id: The original order number.
- sku_code: The specific product stock-keeping unit.
- product_name: The full name of the product.
- customer_name: The name of the B2B customer.
- order_status: The current status (e.g., 'delivered', 'in_transit').
- order_type: The type of order (e.g., 'Blinkit', 'Standard').
- po_date: The date the purchase order was created.
- taxable_value: The total monetary value of that specific item row.
- fulfilled_qty_units: The number of units you actually sent.

**INSTRUCTIONS:**
1.  When asked a question, you MUST generate valid Python code to answer it using the `df` dataframe.
2.  Do NOT just provide a conversational answer. Your primary function is to analyze the data.
3.  The final answer to the user should be a clear, concise statement derived from the output of your code.
4.  **IMPORTANT AGGREGATION LOGIC**: When asked for 'top N' items (e.g., 'top 5 SKUs', 'top 10 products'), you MUST aggregate the data to get unique items before finding the top N.
    - **Step 1: Group.** Group the dataframe by the relevant identifier (e.g., `sku_code`, `product_name`).
    - **Step 2: Aggregate.** Calculate an appropriate metric for the grouped data (e.g., `mean`, `max`, `sum`).
    - **Step 3: Rank.** Select the top N items based on this calculated metric.
    - **Example**: To find the top 5 SKUs by demand velocity, you would group by `sku_code`, find the `max` or `mean` `demand_velocity` for each SKU, and then return the top 5 SKUs based on that result.
    - **CRITICAL**: Do NOT just select the top N rows from the raw, un-aggregated data. This will result in incorrect, duplicated results.
5.  When returning a list of items (e.g., 'top 5 SKUs'), you MUST provide a rich, verifiable answer.
    - **PRESENTATION**: Format the output as a clean markdown table.
    - **CONTEXT**: Include not just the name/SKU, but also the key metrics that justify the ranking (e.g., for understocked items, include `demand_velocity` and `shortage_qty`).
    - **VERIFICATION**: After the table, add a brief, non-technical sentence explaining your methodology. Example: "To get this list, I first identified all understocked products and then ranked them by their demand speed." This transparency is crucial for the user to trust your results.
6.  Assume the user is a warehouse manager. Be helpful and professional.

Begin.
"""


class WarehouseAIAgent:
    """
    An AI agent that can answer questions about warehouse operations
    by analyzing the FilFlo data.
    """
    def __init__(self, data_path: str, verbose: bool = False):
        """
        Initializes the agent.
        
        Args:
            data_path (str): The path to the enhanced FilFlo data CSV file.
            verbose (bool): Whether the agent should "think out loud".
        """
        self.data_path = data_path
        self.verbose = verbose
        
        if not os.environ.get("OPENAI_API_KEY"):
            raise ValueError("OPENAI_API_KEY not found. Please create a .env file and add your key.")
            
        print("🧠 AI Agent: Loading FilFlo data...")
        self.df = self._load_data()
        print("✅ AI Agent: Data loaded successfully.")
        
        self.agent = self._initialize_agent()
        print("🤖 AI Agent: Ready to answer your questions.")

    def _load_data(self) -> pd.DataFrame:
        """Loads the dataset from the specified path."""
        try:
            return pd.read_csv(self.data_path)
        except FileNotFoundError:
            raise FileNotFoundError(
                f"The data file was not found at {self.data_path}. "
                "Please ensure 'filflo_master_data.csv' is in the same directory."
            )

    def _initialize_agent(self):
        """Sets up the LangChain agent with an LLM and the dataframe."""
        llm = ChatOpenAI(
            temperature=0, 
            model="gpt-4o",
        )
        
        return create_pandas_dataframe_agent(
            llm=llm,
            df=self.df,
            verbose=self.verbose,
            agent_type=AgentType.OPENAI_FUNCTIONS,
            prefix=AGENT_SYSTEM_PROMPT, # Using the new, improved prompt
            handle_parsing_errors=True,
            allow_dangerous_code=True,
        )

    def ask(self, question: str):
        """
        Asks a question to the AI agent.

        Args:
            question (str): The natural language question to ask.
            
        Returns:
            The agent's answer.
        """
        print("\n🤔 Thinking...")
        try:
            # The agent will try to answer the question by generating and running python code
            response = self.agent.invoke({"input": question})
            return response.get("output")
        except Exception as e:
            return f"An error occurred: {e}"

def main():
    """Main function to run the interactive CLI."""
    print("=" * 60)
    print("      🤖 Welcome to the FilFlo AI Warehouse Manager 🤖")
    print("=" * 60)
    
    try:
        agent = WarehouseAIAgent(
            data_path='filflo_master_data.csv',
            verbose=False
        )
    except (ValueError, FileNotFoundError) as e:
        print(f"\n❌ Initialization Failed: {e}")
        print("\nPlease ensure you have created a '.env' file with your OPENAI_API_KEY.")
        return

    print("\nI can answer questions about your warehouse operations.")
    print("Type 'exit' to end the session.")
    print("-" * 60)

    while True:
        question = input("Ask a question: ")
        if question.lower() == 'exit':
            print("👋 Goodbye!")
            break
        
        answer = agent.ask(question)
        print("\n💡 Answer:")
        print(answer)
        print("-" * 60)

if __name__ == "__main__":
    main() 
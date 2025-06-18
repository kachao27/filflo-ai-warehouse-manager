import pandas as pd
import numpy as np
import warnings
import sys

# Ignore harmless warnings
warnings.filterwarnings('ignore')

# --- CONFIGURATION ---
# Define the columns we want to extract from the invoice file and their new names
COLUMN_MAPPING = {
    'Invoice Date': 'po_date',
    'Invoice ID': 'unified_id',
    'Invoice Number': 'order_id',
    'SKU': 'sku_code',
    'Item Name': 'product_name',
    'Customer Name': 'customer_name',
    'Invoice Status': 'order_status',
    'CF.Sales Channel': 'order_type',
    'Item Total': 'taxable_value',
    'Quantity': 'fulfilled_qty_units'
}

# Define the data types for our target columns to ensure consistency
DATA_TYPES = {
    'po_date': 'datetime64[ns]',
    'unified_id': 'string',
    'order_id': 'string',
    'sku_code': 'string',
    'product_name': 'string',
    'customer_name': 'string',
    'order_status': 'string',
    'order_type': 'string',
    'taxable_value': 'float64',
    'fulfilled_qty_units': 'int64'
}

# The final, ordered list of columns for the output CSV
FINAL_COLUMNS = [
    'unified_id', 'order_id', 'sku_code', 'product_name', 'customer_name',
    'order_status', 'order_type', 'po_date', 'taxable_value', 
    'fulfilled_qty_units'
]

def process_invoice_data(input_path: str, output_path: str):
    """
    Processes a large invoice CSV file to extract and clean relevant data,
    saving it to a new CSV ready for the AI agent.

    Args:
        input_path (str): Path to the raw invoice CSV file.
        output_path (str): Path to save the processed CSV file.
    """
    print(f"🚀 Starting data processing for: {input_path}")
    
    try:
        # Read only the necessary columns to save memory
        print("Step 1/5: Reading relevant columns from source file...")
        df = pd.read_csv(input_path, usecols=list(COLUMN_MAPPING.keys()))
        print(f"✅ Read {len(df)} rows.")

        # Rename columns to our target schema
        print("Step 2/5: Renaming columns...")
        df.rename(columns=COLUMN_MAPPING, inplace=True)
        
        # --- Data Cleaning and Type Conversion ---
        print("Step 3/5: Cleaning data and converting types...")
        
        # Convert date column, coercing errors to NaT (Not a Time)
        df['po_date'] = pd.to_datetime(df['po_date'], errors='coerce')

        # Fill missing order_type values with a default
        df['order_type'].fillna('Unknown', inplace=True)
        
        # Convert numeric and string columns, handling potential errors
        for col, dtype in DATA_TYPES.items():
            if col != 'po_date':
                try:
                    if 'int' in dtype:
                        df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0).astype(dtype)
                    elif 'float' in dtype:
                        df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0.0).astype(dtype)
                    else: # string
                        df[col] = df[col].astype(dtype)
                except Exception as e:
                    print(f"⚠️ Warning: Could not convert column '{col}' to {dtype}. Error: {e}")
                    df[col] = df[col].astype('string') # Default to string if conversion fails

        # Drop rows where critical information is missing after cleaning
        df.dropna(subset=['po_date', 'unified_id', 'order_id', 'sku_code'], inplace=True)
        
        # Reorder columns to the final desired format
        print("Step 4/5: Finalizing column structure...")
        df = df[FINAL_COLUMNS]

        # --- Save the processed file ---
        print(f"Step 5/5: Saving processed file to: {output_path}")
        df.to_csv(output_path, index=False)
        
        print("\n🎉 Data processing complete! The AI agent now has a clean data source.")

    except FileNotFoundError:
        print(f"❌ ERROR: The input file was not found at '{input_path}'")
        sys.exit(1)
    except Exception as e:
        print(f"❌ An unexpected error occurred: {e}")
        sys.exit(1)

def main():
    """Main function to run the script."""
    input_file = 'CSV Data/Invoice (2).csv'
    output_file = 'filflo_master_data.csv'
    process_invoice_data(input_file, output_file)

if __name__ == "__main__":
    main() 
import pandas as pd
import numpy as np
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

def create_comprehensive_filflo_table():
    """
    Create one comprehensive table combining all FilFlo data sources:
    - B2B Customers
    - Product Master
    - Rate Cards  
    - May Orders
    """
    
    print("🔄 Loading FilFlo data sources...")
    
    # Load all data sources
    try:
        customers_df = pd.read_csv('CSV Data/B2B_Customers_09-Jun-2025.csv')
        products_df = pd.read_csv('CSV Data/Product_Master_Sheet_09-Jun-2025 (2).csv')
        rates_df = pd.read_csv('CSV Data/Rate_Card_09-Jun-2025 (2).csv')
        
        # Load orders data with proper handling for large file
        print("📦 Loading May orders data (4MB file)...")
        orders_df = pd.read_csv('CSV Data/May orders (2).csv', low_memory=False)
        
        print(f"✅ Data loaded successfully:")
        print(f"   - Customers: {len(customers_df)} records")
        print(f"   - Products: {len(products_df)} records") 
        print(f"   - Rate Cards: {len(rates_df)} records")
        print(f"   - Orders: {len(orders_df)} records")
        
    except Exception as e:
        print(f"❌ Error loading data: {e}")
        return None
    
    print("\n🔗 Creating comprehensive unified table...")
    
    # Start with orders as the base (main transaction data)
    comprehensive_df = orders_df.copy()
    
    # Clean and standardize column names
    comprehensive_df.columns = [col.strip() for col in comprehensive_df.columns]
    
    # Add customer details by merging on customer name/GST
    print("🏢 Adding customer details...")
    customers_df.columns = [col.strip() for col in customers_df.columns]
    
    # Create customer lookup dictionary
    customer_lookup = {}
    for _, row in customers_df.iterrows():
        customer_name = str(row.get('Customer Name', '')).strip()
        customer_lookup[customer_name] = {
            'Customer_Contact': row.get('Contact No', ''),
            'Customer_Email': row.get('Email Id', ''),
            'Customer_Address': f"{row.get('Address Line 1', '')} {row.get('Address Line 2', '')} {row.get('City', '')} {row.get('State', '')}".strip(),
            'Customer_Pincode': row.get('Pincode', ''),
            'Rate_Card': row.get('Rate Card', '')
        }
    
    # Add customer details to comprehensive table
    comprehensive_df['Customer_Contact'] = comprehensive_df['Customer'].apply(
        lambda x: customer_lookup.get(str(x).strip(), {}).get('Customer_Contact', '')
    )
    comprehensive_df['Customer_Email'] = comprehensive_df['Customer'].apply(
        lambda x: customer_lookup.get(str(x).strip(), {}).get('Customer_Email', '')
    )
    comprehensive_df['Customer_Full_Address'] = comprehensive_df['Customer'].apply(
        lambda x: customer_lookup.get(str(x).strip(), {}).get('Customer_Address', '')
    )
    comprehensive_df['Customer_Pincode'] = comprehensive_df['Customer'].apply(
        lambda x: customer_lookup.get(str(x).strip(), {}).get('Customer_Pincode', '')
    )
    comprehensive_df['Rate_Card'] = comprehensive_df['Customer'].apply(
        lambda x: customer_lookup.get(str(x).strip(), {}).get('Rate_Card', '')
    )
    
    # Add product details by merging on SKU code
    print("📦 Adding product details...")
    products_df.columns = [col.strip() for col in products_df.columns]
    
    # Create product lookup dictionary
    product_lookup = {}
    for _, row in products_df.iterrows():
        sku_code = str(row.get('PRODUCT SKU CODE', '')).strip()
        product_lookup[sku_code] = {
            'Product_Name': row.get('PRODUCT NAME', ''),
            'Category': row.get('CATEGORY', ''),
            'HSN_Code': row.get('HSN CODE', ''),
            'Tax_Slab': row.get('TAX SLAB', ''),
            'Price_Per_Unit': row.get('Price Per Unit', 0),
            'Case_Size': row.get('CASE SIZE', ''),
            'Weight': row.get('WEIGHT', ''),
            'Dimension': row.get('DIMENSION', ''),
            'Lower_Threshold': row.get('LOWER THRESHOLD', ''),
            'Upper_Threshold': row.get('UPPER THRESHOLD', ''),
            'Zepto_SKU': row.get('ZEPTO SKU', ''),
            'Blinkit_SKU': row.get('BLINKIT SKU', ''),
            'Swiggy_SKU': row.get('SWIGGY SKU', '')
        }
    
    # Add product details to comprehensive table
    comprehensive_df['Product_Name'] = comprehensive_df['SKU Code'].apply(
        lambda x: product_lookup.get(str(x).strip(), {}).get('Product_Name', '')
    )
    comprehensive_df['Category'] = comprehensive_df['SKU Code'].apply(
        lambda x: product_lookup.get(str(x).strip(), {}).get('Category', '')
    )
    comprehensive_df['HSN_Code'] = comprehensive_df['SKU Code'].apply(
        lambda x: product_lookup.get(str(x).strip(), {}).get('HSN_Code', '')
    )
    comprehensive_df['Tax_Slab'] = comprehensive_df['SKU Code'].apply(
        lambda x: product_lookup.get(str(x).strip(), {}).get('Tax_Slab', '')
    )
    comprehensive_df['Master_Price_Per_Unit'] = comprehensive_df['SKU Code'].apply(
        lambda x: product_lookup.get(str(x).strip(), {}).get('Price_Per_Unit', 0)
    )
    comprehensive_df['Case_Size'] = comprehensive_df['SKU Code'].apply(
        lambda x: product_lookup.get(str(x).strip(), {}).get('Case_Size', '')
    )
    comprehensive_df['Weight'] = comprehensive_df['SKU Code'].apply(
        lambda x: product_lookup.get(str(x).strip(), {}).get('Weight', '')
    )
    comprehensive_df['Dimension'] = comprehensive_df['SKU Code'].apply(
        lambda x: product_lookup.get(str(x).strip(), {}).get('Dimension', '')
    )
    comprehensive_df['Lower_Threshold'] = comprehensive_df['SKU Code'].apply(
        lambda x: product_lookup.get(str(x).strip(), {}).get('Lower_Threshold', '')
    )
    comprehensive_df['Upper_Threshold'] = comprehensive_df['SKU Code'].apply(
        lambda x: product_lookup.get(str(x).strip(), {}).get('Upper_Threshold', '')
    )
    comprehensive_df['Zepto_SKU'] = comprehensive_df['SKU Code'].apply(
        lambda x: product_lookup.get(str(x).strip(), {}).get('Zepto_SKU', '')
    )
    comprehensive_df['Blinkit_SKU'] = comprehensive_df['SKU Code'].apply(
        lambda x: product_lookup.get(str(x).strip(), {}).get('Blinkit_SKU', '')
    )
    comprehensive_df['Swiggy_SKU'] = comprehensive_df['SKU Code'].apply(
        lambda x: product_lookup.get(str(x).strip(), {}).get('Swiggy_SKU', '')
    )
    
    # Add rate card pricing
    print("💰 Adding rate card pricing...")
    rates_df.columns = [col.strip() for col in rates_df.columns]
    
    # Create rate card lookup dictionary
    rate_lookup = {}
    for _, row in rates_df.iterrows():
        sku_code = str(row.get('Product SKU Code', '')).strip()
        rate_card_name = str(row.get('Rate Card Name', '')).strip()
        key = f"{sku_code}_{rate_card_name}"
        rate_lookup[key] = {
            'Rate_Card_Price': row.get('Price (₹)', 0),
            'Rate_Card_Type': row.get('Rate Card Type', ''),
            'Rate_Card_Created': row.get('Created On', '')
        }
    
    # Add rate card pricing to comprehensive table
    comprehensive_df['Rate_Card_Price'] = comprehensive_df.apply(
        lambda row: rate_lookup.get(f"{str(row['SKU Code']).strip()}_{str(row.get('Rate_Card', '')).strip()}", {}).get('Rate_Card_Price', 0), axis=1
    )
    comprehensive_df['Rate_Card_Type'] = comprehensive_df.apply(
        lambda row: rate_lookup.get(f"{str(row['SKU Code']).strip()}_{str(row.get('Rate_Card', '')).strip()}", {}).get('Rate_Card_Type', ''), axis=1
    )
    comprehensive_df['Rate_Card_Created'] = comprehensive_df.apply(
        lambda row: rate_lookup.get(f"{str(row['SKU Code']).strip()}_{str(row.get('Rate_Card', '')).strip()}", {}).get('Rate_Card_Created', ''), axis=1
    )
    
    # Extract flavor and package type from product names
    print("🏷️ Extracting product attributes...")
    comprehensive_df['Flavor'] = comprehensive_df['Product_Name'].apply(extract_flavor)
    comprehensive_df['Package_Type'] = comprehensive_df['Product_Name'].apply(extract_package_type)
    
    # Clean and organize final columns
    print("🗂️ Organizing final structure...")
    
    final_columns = [
        'Order ID', 'PO Number', 'Invoice Number', 'Customer', 'Customer GST', 
        'SKU Code', 'Product_Name', 'Category', 'Flavor', 'Package_Type',
        'PO Date', 'Approved Date', 'Dispatch Date', 'Delivery Date', 'Order Status',
        'WH', 'Order Qty (Case Units)', 'Order Qty (in Units)', 'Approved Qty (in Units)', 
        'Fulfilled/Dispatched Qty (in Units)', 'Master_Price_Per_Unit', 'Rate_Card_Price',
        'Total Invoice Amount With Tax', 'Rate_Card_Type', 'HSN_Code', 'Tax_Slab',
        'Case_Size', 'Weight', 'Dimension', 'Zepto_SKU', 'Blinkit_SKU', 'Swiggy_SKU',
        'Customer_Contact', 'Customer_Email', 'Customer_Full_Address', 'Customer_Pincode',
        'Shipping Address', 'AWB Number', 'Mode of Transport', 'Order Vs Fulfilled %',
        'Approved Vs Fulfilled %', 'Lower_Threshold', 'Upper_Threshold', 'GRN Qty (in Units)',
        'Approval Remarks', 'WH/Fulfillment Remarks', 'Rate_Card_Created'
    ]
    
    # Select only available columns
    available_columns = [col for col in final_columns if col in comprehensive_df.columns]
    comprehensive_df = comprehensive_df[available_columns]
    
    # Add processing timestamp
    comprehensive_df['Data_Processed_At'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    print(f"\n✅ Comprehensive table created with {len(comprehensive_df)} rows and {len(comprehensive_df.columns)} columns")
    
    return comprehensive_df

def extract_flavor(product_name):
    """Extract flavor from product name"""
    if pd.isna(product_name):
        return ''
    
    product_name = str(product_name).lower()
    flavors = ['french vanilla', 'hazelnut', 'original', 'xpresso', 'decaf', 'classic', 
               'salted caramel', 'belgian mocha', 'vietnamese', 'caramel latte', 'filter kaapi']
    
    for flavor in flavors:
        if flavor in product_name:
            return flavor.title()
    return 'Original'

def extract_package_type(product_name):
    """Extract package type from product name"""
    if pd.isna(product_name):
        return ''
    
    product_name = str(product_name).lower()
    
    if 'sachet' in product_name:
        return 'Sachet'
    elif 'glass jar' in product_name:
        return 'Glass Jar'
    elif 'can' in product_name:
        return 'Can'
    elif 'bottle' in product_name:
        return 'Bottle'
    elif 'bag' in product_name:
        return 'Bag'
    elif 'mug' in product_name:
        return 'Mug'
    elif 'box' in product_name:
        return 'Box'
    else:
        return 'Pack'

if __name__ == "__main__":
    print("🚀 Creating Comprehensive FilFlo Data Table...")
    print("=" * 60)
    
    # Create comprehensive table
    df = create_comprehensive_filflo_table()
    
    if df is not None:
        # Save to CSV
        output_file = 'comprehensive_filflo_data.csv'
        df.to_csv(output_file, index=False)
        
        print(f"\n💾 Saved comprehensive table to: {output_file}")
        print(f"📊 Total Records: {len(df):,}")
        print(f"📋 Total Columns: {len(df.columns)}")
        
        print("\n📈 Data Summary:")
        print(f"   - Unique Customers: {df['Customer'].nunique()}")
        print(f"   - Unique Products: {df['SKU Code'].nunique()}")
        print(f"   - Unique Orders: {df['Order ID'].nunique()}")
        print(f"   - Total Order Value: ₹{df['Total Invoice Amount With Tax'].sum():,.2f}")
        
        print("\n🏷️ Top Categories:")
        print(df['Category'].value_counts().head())
        
        print("\n✅ Comprehensive FilFlo table created successfully!")
        print("=" * 60)
    else:
        print("❌ Failed to create comprehensive table") 
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import uuid

def enhance_filflo_table_with_required_keys():
    """
    Enhance the comprehensive table to include all 20 required keys:
    unified_id, order_id, sku_code, product_name, customer_name, order_status, order_type,
    po_date, delivery_date, taxable_value, order_qty_units, fulfilled_qty_units,
    shortage_qty, fulfillment_percentage, inventory_age_days, demand_velocity,
    is_overstocked, is_understocked, is_stockout, priority_score
    """
    
    print("🔄 Loading comprehensive FilFlo data...")
    df = pd.read_csv('comprehensive_filflo_data.csv')
    
    print(f"✅ Loaded {len(df):,} records with {len(df.columns)} columns")
    
    # Create the enhanced table with required keys
    enhanced_df = pd.DataFrame()
    
    print("🔧 Mapping and calculating required fields...")
    
    # 1. unified_id - Create unique identifier
    enhanced_df['unified_id'] = [str(uuid.uuid4())[:8] for _ in range(len(df))]
    
    # 2. order_id - Map from existing
    enhanced_df['order_id'] = df['Order ID']
    
    # 3. sku_code - Map from existing
    enhanced_df['sku_code'] = df['SKU Code']
    
    # 4. product_name - Map from existing
    enhanced_df['product_name'] = df['Product_Name']
    
    # 5. customer_name - Map from existing
    enhanced_df['customer_name'] = df['Customer']
    
    # 6. order_status - Map from existing
    enhanced_df['order_status'] = df['Order Status']
    
    # 7. order_type - Extract from original orders data
    print("📋 Adding order type from original data...")
    orders_df = pd.read_csv('CSV Data/May orders (2).csv', low_memory=False)
    order_type_lookup = dict(zip(orders_df['Order ID'], orders_df['Order Type']))
    enhanced_df['order_type'] = enhanced_df['order_id'].map(order_type_lookup).fillna('Standard')
    
    # 8. po_date - Map from existing
    enhanced_df['po_date'] = df['PO Date']
    
    # 9. delivery_date - Map from existing
    enhanced_df['delivery_date'] = df['Delivery Date']
    
    # 10. taxable_value - Use Total Invoice Amount or calculate
    enhanced_df['taxable_value'] = df['Total Invoice Amount With Tax']
    
    # 11. order_qty_units - Map from existing
    enhanced_df['order_qty_units'] = df['Order Qty (in Units)']
    
    # 12. fulfilled_qty_units - Map from existing
    enhanced_df['fulfilled_qty_units'] = df['Fulfilled/Dispatched Qty (in Units)']
    
    # 13. shortage_qty - Calculate shortage
    enhanced_df['shortage_qty'] = enhanced_df['order_qty_units'] - enhanced_df['fulfilled_qty_units']
    enhanced_df['shortage_qty'] = enhanced_df['shortage_qty'].clip(lower=0)  # No negative shortages
    
    # 14. fulfillment_percentage - Map from existing
    enhanced_df['fulfillment_percentage'] = df['Order Vs Fulfilled %'].str.replace('%', '').astype(float)
    
    # 15. inventory_age_days - Calculate based on PO date
    print("📅 Calculating inventory age...")
    enhanced_df['po_date_clean'] = pd.to_datetime(enhanced_df['po_date'], errors='coerce')
    current_date = datetime.now()
    enhanced_df['inventory_age_days'] = (current_date - enhanced_df['po_date_clean']).dt.days
    enhanced_df['inventory_age_days'] = enhanced_df['inventory_age_days'].fillna(0).clip(lower=0)
    
    # 16. demand_velocity - Calculate based on order frequency and quantities
    print("🚀 Calculating demand velocity...")
    sku_stats = enhanced_df.groupby('sku_code').agg({
        'order_qty_units': 'sum',
        'order_id': 'count',
        'inventory_age_days': 'mean'
    }).reset_index()
    
    sku_stats['demand_velocity'] = (sku_stats['order_qty_units'] / 
                                   (sku_stats['inventory_age_days'] + 1)) * sku_stats['order_id']
    
    velocity_lookup = dict(zip(sku_stats['sku_code'], sku_stats['demand_velocity']))
    enhanced_df['demand_velocity'] = enhanced_df['sku_code'].map(velocity_lookup).fillna(0)
    
    # 17. is_overstocked - Based on low demand velocity and high inventory age
    print("📊 Calculating stock status indicators...")
    velocity_q75 = enhanced_df['demand_velocity'].quantile(0.75)
    age_q75 = enhanced_df['inventory_age_days'].quantile(0.75)
    
    enhanced_df['is_overstocked'] = (
        (enhanced_df['demand_velocity'] < velocity_q75 * 0.5) & 
        (enhanced_df['inventory_age_days'] > age_q75)
    ).astype(int)
    
    # 18. is_understocked - Based on high demand velocity and shortages
    enhanced_df['is_understocked'] = (
        (enhanced_df['demand_velocity'] > velocity_q75) & 
        (enhanced_df['shortage_qty'] > 0)
    ).astype(int)
    
    # 19. is_stockout - Based on zero fulfillment
    enhanced_df['is_stockout'] = (enhanced_df['fulfilled_qty_units'] == 0).astype(int)
    
    # 20. priority_score - Calculate based on multiple factors
    print("🎯 Calculating priority scores...")
    
    # Normalize components for priority score
    demand_norm = enhanced_df['demand_velocity'] / (enhanced_df['demand_velocity'].max() + 1)
    shortage_norm = enhanced_df['shortage_qty'] / (enhanced_df['shortage_qty'].max() + 1)
    value_norm = enhanced_df['taxable_value'] / (enhanced_df['taxable_value'].max() + 1)
    
    # Priority score formula: weighted combination
    enhanced_df['priority_score'] = (
        demand_norm * 0.4 +           # 40% demand velocity
        shortage_norm * 0.3 +         # 30% shortage impact
        value_norm * 0.2 +            # 20% order value
        enhanced_df['is_stockout'] * 0.1  # 10% stockout penalty
    ) * 100
    
    enhanced_df['priority_score'] = enhanced_df['priority_score'].round(2)
    
    # Clean up temporary columns
    enhanced_df = enhanced_df.drop(['po_date_clean'], axis=1)
    
    print(f"\n✅ Enhanced table created with {len(enhanced_df)} rows and {len(enhanced_df.columns)} columns")
    
    return enhanced_df

def generate_data_summary(df):
    """Generate summary statistics for the enhanced data"""
    print("\n📊 DATA SUMMARY:")
    print("=" * 50)
    
    print(f"📋 Total Records: {len(df):,}")
    print(f"🏢 Unique Customers: {df['customer_name'].nunique():,}")
    print(f"📦 Unique Products: {df['sku_code'].nunique():,}")
    print(f"🆔 Unique Orders: {df['order_id'].nunique():,}")
    
    print(f"\n💰 Financial Metrics:")
    print(f"   Total Order Value: ₹{df['taxable_value'].sum():,.2f}")
    print(f"   Average Order Value: ₹{df['taxable_value'].mean():,.2f}")
    
    print(f"\n📈 Fulfillment Metrics:")
    print(f"   Average Fulfillment Rate: {df['fulfillment_percentage'].mean():.1f}%")
    print(f"   Total Shortage Quantity: {df['shortage_qty'].sum():,} units")
    print(f"   Orders with Shortages: {(df['shortage_qty'] > 0).sum():,}")
    
    print(f"\n🚨 Stock Status:")
    print(f"   Overstocked SKUs: {df['is_overstocked'].sum():,}")
    print(f"   Understocked SKUs: {df['is_understocked'].sum():,}")
    print(f"   Stockout Orders: {df['is_stockout'].sum():,}")
    
    print(f"\n🎯 Priority Distribution:")
    print(f"   High Priority (>75): {(df['priority_score'] > 75).sum():,}")
    print(f"   Medium Priority (25-75): {((df['priority_score'] >= 25) & (df['priority_score'] <= 75)).sum():,}")
    print(f"   Low Priority (<25): {(df['priority_score'] < 25).sum():,}")
    
    print(f"\n📅 Inventory Age:")
    print(f"   Average Age: {df['inventory_age_days'].mean():.1f} days")
    print(f"   Oldest Inventory: {df['inventory_age_days'].max()} days")
    
    return df

if __name__ == "__main__":
    print("🚀 Enhancing FilFlo Table with Required Keys...")
    print("=" * 60)
    
    # Create enhanced table
    enhanced_df = enhance_filflo_table_with_required_keys()
    
    if enhanced_df is not None:
        # Save enhanced table
        output_file = 'filflo_enhanced_with_required_keys.csv'
        enhanced_df.to_csv(output_file, index=False)
        
        print(f"\n💾 Saved enhanced table to: {output_file}")
        
        # Generate summary
        generate_data_summary(enhanced_df)
        
        print(f"\n📋 Required Keys Verification:")
        required_keys = [
            'unified_id', 'order_id', 'sku_code', 'product_name', 'customer_name', 
            'order_status', 'order_type', 'po_date', 'delivery_date', 'taxable_value',
            'order_qty_units', 'fulfilled_qty_units', 'shortage_qty', 'fulfillment_percentage',
            'inventory_age_days', 'demand_velocity', 'is_overstocked', 'is_understocked',
            'is_stockout', 'priority_score'
        ]
        
        for key in required_keys:
            status = "✅" if key in enhanced_df.columns else "❌"
            print(f"   {status} {key}")
        
        print("\n✅ Enhanced FilFlo table with all required keys created successfully!")
        print("=" * 60)
    else:
        print("❌ Failed to create enhanced table") 
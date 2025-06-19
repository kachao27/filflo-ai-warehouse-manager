import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from '@mui/material';
import {
  TrendingUp,
  Assessment,
  ShowChart,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import {
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Legend,
} from 'recharts';

// Sample data for different analytics views
const salesTrendData = [
  { month: 'Jan', sales: 65000, orders: 320, revenue: 1200000 },
  { month: 'Feb', sales: 59000, orders: 295, revenue: 1100000 },
  { month: 'Mar', sales: 80000, orders: 410, revenue: 1500000 },
  { month: 'Apr', sales: 81000, orders: 425, revenue: 1520000 },
  { month: 'May', sales: 56000, orders: 280, revenue: 1050000 },
  { month: 'Jun', sales: 75000, orders: 385, revenue: 1400000 },
];

const inventoryData = [
  { category: 'Instant Coffee', inStock: 450, reorderLevel: 100, value: 2250000 },
  { category: 'Cold Brew', inStock: 320, reorderLevel: 80, value: 1920000 },
  { category: 'Hot Brew', inStock: 280, reorderLevel: 60, value: 1400000 },
  { category: 'Accessories', inStock: 150, reorderLevel: 40, value: 450000 },
  { category: 'Packaging', inStock: 200, reorderLevel: 50, value: 200000 },
];

const productPerformanceData = [
  { name: 'Sleepy Owl Cold Coffee Can Hazelnut', sales: 11740000, units: 15600, growth: 12.5 },
  { name: 'Instant Coffee Premium Blend', sales: 8920000, units: 12400, growth: 8.2 },
  { name: 'Cold Brew Concentrate Original', sales: 7650000, units: 10200, growth: 15.8 },
  { name: 'Hot Brew Dark Roast', sales: 6420000, units: 8900, growth: -2.1 },
  { name: 'Coffee Accessories Set', sales: 3240000, units: 5400, growth: 22.3 },
];

const Analytics: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [timeRange, setTimeRange] = useState('6months');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const TabPanel: React.FC<{ children: React.ReactNode; value: number; index: number }> = ({
    children,
    value,
    index,
  }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );

  return (
    <Box sx={{ width: '100%', maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'white', mb: 1 }}>
              Analytics Dashboard
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              Deep insights into your warehouse performance and trends
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel sx={{ color: 'white' }}>Time Range</InputLabel>
              <Select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                sx={{
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                  '& .MuiSvgIcon-root': { color: 'white' },
                }}
              >
                <MenuItem value="1month">1 Month</MenuItem>
                <MenuItem value="3months">3 Months</MenuItem>
                <MenuItem value="6months">6 Months</MenuItem>
                <MenuItem value="1year">1 Year</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ pb: 0 }}>
            <Tabs value={currentTab} onChange={handleTabChange}>
              <Tab
                icon={<TrendingUp />}
                label="Sales Trends"
                iconPosition="start"
                sx={{ minHeight: 48 }}
              />
              <Tab
                icon={<Assessment />}
                label="Inventory"
                iconPosition="start"
                sx={{ minHeight: 48 }}
              />
              <Tab
                icon={<ShowChart />}
                label="Performance"
                iconPosition="start"
                sx={{ minHeight: 48 }}
              />
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>

      {/* Sales Trends Tab */}
      <TabPanel value={currentTab} index={0}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ display: 'flex', gap: 3, flexDirection: 'column' }}>
            {/* Revenue Chart */}
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Revenue & Sales Trend
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={salesTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#6c757d" />
                    <YAxis yAxisId="left" stroke="#6c757d" />
                    <YAxis yAxisId="right" orientation="right" stroke="#6c757d" />
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(255,255,255,0.95)',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      }}
                    />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="revenue"
                      fill="url(#revenueGradient)"
                      stroke="#667eea"
                      strokeWidth={3}
                      name="Revenue (₹)"
                    />
                    <Bar yAxisId="right" dataKey="orders" fill="#764ba2" name="Orders" />
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#667eea" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#667eea" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Key Metrics */}
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              {[
                { label: 'Total Revenue', value: '₹8.77M', change: '+12.5%', color: '#28a745' },
                { label: 'Total Orders', value: '2,115', change: '+8.3%', color: '#28a745' },
                { label: 'Avg Order Value', value: '₹4,147', change: '+3.8%', color: '#28a745' },
                { label: 'Growth Rate', value: '12.5%', change: '+2.1%', color: '#28a745' },
              ].map((metric, index) => (
                <Card key={index} sx={{ flex: 1, minWidth: 200 }}>
                  <CardContent>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#2c3e50', mb: 1 }}>
                      {metric.value}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6c757d', mb: 1 }}>
                      {metric.label}
                    </Typography>
                    <Chip
                      label={metric.change}
                      size="small"
                      sx={{ background: metric.color, color: 'white' }}
                    />
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        </motion.div>
      </TabPanel>

      {/* Inventory Tab */}
      <TabPanel value={currentTab} index={1}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ display: 'flex', gap: 3, flexDirection: 'column' }}>
            {/* Inventory Levels */}
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Inventory Levels by Category
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={inventoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="category" stroke="#6c757d" />
                    <YAxis stroke="#6c757d" />
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(255,255,255,0.95)',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="inStock" fill="#667eea" name="In Stock" />
                    <Bar dataKey="reorderLevel" fill="#ffc107" name="Reorder Level" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Inventory Value Distribution */}
            <Box sx={{ display: 'flex', gap: 3 }}>
              <Card sx={{ flex: 1 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                    Inventory Value Distribution
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={inventoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                        nameKey="category"
                      >
                        {inventoryData.map((entry, index) => {
                          const colors = ['#667eea', '#764ba2', '#4facfe', '#fa709a', '#a8edea'];
                          return <Cell key={`cell-${index}`} fill={colors[index]} />;
                        })}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card sx={{ flex: 1 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                    Stock Alerts
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {inventoryData
                      .filter(item => item.inStock <= item.reorderLevel * 2)
                      .map((item, index) => (
                        <Box
                          key={index}
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            background: item.inStock <= item.reorderLevel
                              ? 'rgba(220, 53, 69, 0.1)'
                              : 'rgba(255, 193, 7, 0.1)',
                            border: `1px solid ${
                              item.inStock <= item.reorderLevel ? '#dc3545' : '#ffc107'
                            }`,
                          }}
                        >
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {item.category}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#6c757d' }}>
                            Stock: {item.inStock} units
                          </Typography>
                          <Chip
                            label={item.inStock <= item.reorderLevel ? 'Critical' : 'Low Stock'}
                            size="small"
                            sx={{
                              mt: 1,
                              background: item.inStock <= item.reorderLevel ? '#dc3545' : '#ffc107',
                              color: 'white',
                            }}
                          />
                        </Box>
                      ))}
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </motion.div>
      </TabPanel>

      {/* Performance Tab */}
      <TabPanel value={currentTab} index={2}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Product Performance Analysis
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {productPerformanceData.map((product, index) => (
                  <Box
                    key={index}
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                        {product.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6c757d' }}>
                        {product.units.toLocaleString()} units sold
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center', mx: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        ₹{(product.sales / 1000000).toFixed(2)}M
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#6c757d' }}>
                        Sales Value
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Chip
                        label={`${product.growth > 0 ? '+' : ''}${product.growth}%`}
                        size="small"
                        sx={{
                          background: product.growth > 0 ? '#28a745' : '#dc3545',
                          color: 'white',
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </motion.div>
      </TabPanel>
    </Box>
  );
};

export default Analytics; 
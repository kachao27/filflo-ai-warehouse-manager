import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Inventory,
  LocalShipping,
  AttachMoney,
  Warning,
  CheckCircle,
  Refresh,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// Sample data - in production, this would come from your API
const salesData = [
  { name: 'Jan', sales: 4000, orders: 240 },
  { name: 'Feb', sales: 3000, orders: 139 },
  { name: 'Mar', sales: 2000, orders: 980 },
  { name: 'Apr', sales: 2780, orders: 390 },
  { name: 'May', sales: 1890, orders: 480 },
  { name: 'Jun', sales: 2390, orders: 380 },
];

const productCategories = [
  { name: 'Instant Coffee', value: 400, color: '#667eea' },
  { name: 'Cold Brew', value: 300, color: '#764ba2' },
  { name: 'Hot Brew', value: 200, color: '#4facfe' },
  { name: 'Accessories', value: 100, color: '#fa709a' },
];

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const refreshDashboard = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  const MetricCard: React.FC<{
    title: string;
    value: string;
    change: string;
    trend: 'up' | 'down';
    icon: React.ReactNode;
    color: string;
  }> = ({ title, value, change, trend, icon, color }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#2c3e50', mb: 1 }}>
                {value}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6c757d', mb: 2 }}>
                {title}
              </Typography>
              <Chip
                icon={trend === 'up' ? <TrendingUp /> : <TrendingDown />}
                label={change}
                size="small"
                sx={{
                  background: trend === 'up' ? '#28a745' : '#dc3545',
                  color: 'white',
                  '& .MuiChip-icon': { color: 'white' },
                }}
              />
            </Box>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: 3,
                background: color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                position: 'absolute',
                top: -10,
                right: 20,
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              }}
            >
              {icon}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
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
              Warehouse Dashboard
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              Real-time insights into your FilFlo operations
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={refreshDashboard}
            disabled={loading}
            sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
          >
            Refresh Data
          </Button>
        </Box>
      </motion.div>

      {loading && <LinearProgress sx={{ mb: 3, borderRadius: 1 }} />}

      {/* Key Metrics */}
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 3, 
        mb: 4,
        '& > *': {
          flex: '1 1 300px',
          minWidth: '250px',
        }
      }}>
        <MetricCard
          title="Total Revenue"
          value="₹2.4M"
          change="+12.5%"
          trend="up"
          icon={<AttachMoney />}
          color="linear-gradient(45deg, #667eea, #764ba2)"
        />
        <MetricCard
          title="Orders Processed"
          value="1,234"
          change="+8.2%"
          trend="up"
          icon={<LocalShipping />}
          color="linear-gradient(45deg, #4facfe, #00f2fe)"
        />
        <MetricCard
          title="Inventory Items"
          value="1,530"
          change="-2.1%"
          trend="down"
          icon={<Inventory />}
          color="linear-gradient(45deg, #fa709a, #fee140)"
        />
        <MetricCard
          title="Active Products"
          value="891"
          change="+5.7%"
          trend="up"
          icon={<CheckCircle />}
          color="linear-gradient(45deg, #a8edea, #fed6e3)"
        />
      </Box>

      {/* Charts Section */}
      <Box sx={{ 
        display: 'flex', 
        gap: 3, 
        mb: 4,
        flexDirection: { xs: 'column', lg: 'row' }
      }}>
        {/* Sales Trend */}
        <Box sx={{ flex: '2 1 600px', minWidth: 0 }}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Sales & Orders Trend
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" stroke="#6c757d" />
                    <YAxis stroke="#6c757d" />
                    <Tooltip 
                      contentStyle={{
                        background: 'rgba(255,255,255,0.95)',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="sales"
                      stroke="#667eea"
                      fill="url(#salesGradient)"
                      strokeWidth={3}
                    />
                    <defs>
                      <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#667eea" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#667eea" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </Box>

        {/* Product Categories */}
        <Box sx={{ flex: '1 1 400px', minWidth: 0 }}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Product Categories
                </Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={productCategories}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {productCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <Box sx={{ mt: 2 }}>
                  {productCategories.map((category, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: category.color,
                          mr: 1,
                        }}
                      />
                      <Typography variant="body2" sx={{ flex: 1 }}>
                        {category.name}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {category.value}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Box>
      </Box>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Quick Actions
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 2,
              '& > *': {
                flex: '1 1 200px',
                minWidth: '180px',
              }
            }}>
              {[
                { label: 'Inventory Report', color: '#667eea', icon: <Inventory /> },
                { label: 'Sales Analysis', color: '#28a745', icon: <TrendingUp /> },
                { label: 'Production Plan', color: '#ffc107', icon: <Warning /> },
                { label: 'Order Status', color: '#17a2b8', icon: <LocalShipping /> },
              ].map((action, index) => (
                <Button
                  key={index}
                  fullWidth
                  variant="outlined"
                  startIcon={action.icon}
                  sx={{
                    p: 2,
                    borderColor: action.color,
                    color: action.color,
                    '&:hover': {
                      backgroundColor: `${action.color}15`,
                      borderColor: action.color,
                    },
                  }}
                >
                  {action.label}
                </Button>
              ))}
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default Dashboard; 
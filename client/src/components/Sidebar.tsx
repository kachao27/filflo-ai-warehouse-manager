import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Chat as ChatIcon,
  Analytics as AnalyticsIcon,
  Inventory,
  Assessment,
  TrendingUp,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'AI Chat', icon: <ChatIcon />, path: '/chat' },
  { text: 'Analytics', icon: <AnalyticsIcon />, path: '/analytics' },
];

const quickActions = [
  { text: 'Inventory Status', icon: <Inventory />, action: 'inventory' },
  { text: 'Performance Report', icon: <Assessment />, action: 'performance' },
  { text: 'Sales Trends', icon: <TrendingUp />, action: 'trends' },
];

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  const drawerWidth = 240;

  return (
    <Drawer
      variant="temporary"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: 'none',
          borderRight: '1px solid rgba(0,0,0,0.1)',
        },
      }}
    >
      <Box sx={{ mt: 8, p: 2 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography variant="h6" sx={{ mb: 2, color: '#2c3e50', fontWeight: 600 }}>
            Navigation
          </Typography>
          
          <List>
            {menuItems.map((item, index) => (
              <motion.div
                key={item.text}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <ListItem disablePadding sx={{ mb: 1 }}>
                  <ListItemButton
                    onClick={() => handleNavigation(item.path)}
                    sx={{
                      borderRadius: 2,
                      background: location.pathname === item.path 
                        ? 'linear-gradient(45deg, #667eea, #764ba2)'
                        : 'transparent',
                      color: location.pathname === item.path ? 'white' : '#2c3e50',
                      '&:hover': {
                        background: location.pathname === item.path
                          ? 'linear-gradient(45deg, #5a6fd8, #6a4190)'
                          : 'rgba(102, 126, 234, 0.1)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: location.pathname === item.path ? 'white' : '#667eea',
                        minWidth: 40,
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.text}
                      primaryTypographyProps={{
                        fontWeight: location.pathname === item.path ? 600 : 500,
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              </motion.div>
            ))}
          </List>

          <Divider sx={{ my: 3 }} />

          <Typography variant="subtitle2" sx={{ mb: 2, color: '#6c757d', fontWeight: 600 }}>
            Quick Actions
          </Typography>

          <List>
            {quickActions.map((item, index) => (
              <motion.div
                key={item.text}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: (menuItems.length + index) * 0.1 }}
              >
                <ListItem disablePadding sx={{ mb: 1 }}>
                  <ListItemButton
                    sx={{
                      borderRadius: 2,
                      color: '#6c757d',
                      '&:hover': {
                        background: 'rgba(102, 126, 234, 0.1)',
                        color: '#667eea',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: 'inherit',
                        minWidth: 35,
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.text}
                      primaryTypographyProps={{
                        fontSize: '0.875rem',
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              </motion.div>
            ))}
          </List>
        </motion.div>
      </Box>
    </Drawer>
  );
};

export default Sidebar; 
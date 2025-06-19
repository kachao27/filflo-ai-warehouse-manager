import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Button,
  Badge,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications,
  Settings,
  AccountCircle,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(0,0,0,0.1)',
        color: '#2c3e50'
      }}
      elevation={0}
    >
      <Toolbar>
        <IconButton
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2, color: '#667eea' }}
        >
          <MenuIcon />
        </IconButton>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2,
              }}
            >
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                F
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#2c3e50' }}>
                FilFlo
              </Typography>
              <Typography variant="caption" sx={{ color: '#6c757d', fontSize: '0.7rem' }}>
                AI Warehouse Manager
              </Typography>
            </Box>
          </Box>
        </motion.div>

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton sx={{ color: '#667eea' }}>
            <Badge badgeContent={3} color="error">
              <Notifications />
            </Badge>
          </IconButton>
          
          <IconButton sx={{ color: '#667eea' }}>
            <Settings />
          </IconButton>

          <Button
            startIcon={<AccountCircle />}
            sx={{
              ml: 1,
              color: '#2c3e50',
              '&:hover': {
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
              },
            }}
          >
            Admin
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 
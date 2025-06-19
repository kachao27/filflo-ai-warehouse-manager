import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#667eea',
      light: '#9bb5ff',
      dark: '#2c4eb7',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#764ba2',
      light: '#a578d5',
      dark: '#4a2072',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8f9fa',
      paper: 'rgba(255, 255, 255, 0.95)',
    },
    text: {
      primary: '#2c3e50',
      secondary: '#6c757d',
    },
    success: {
      main: '#28a745',
      light: '#5cbf5a',
      dark: '#1e7e34',
    },
    warning: {
      main: '#ffc107',
      light: '#fff350',
      dark: '#ff8f00',
    },
    error: {
      main: '#dc3545',
      light: '#ff6b7d',
      dark: '#c82333',
    },
    info: {
      main: '#17a2b8',
      light: '#4dd4e8',
      dark: '#117a8b',
    },
  },
  typography: {
    fontFamily: '"Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '3rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '2.5rem',
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
  },
  shape: {
    borderRadius: 12,
  },
  spacing: 8,
  shadows: [
    'none',
    '0px 2px 4px rgba(0,0,0,0.05)',
    '0px 4px 8px rgba(0,0,0,0.1)',
    '0px 8px 16px rgba(0,0,0,0.1)',
    '0px 12px 24px rgba(0,0,0,0.15)',
    '0px 16px 32px rgba(0,0,0,0.15)',
    '0px 20px 40px rgba(0,0,0,0.2)',
    '0px 24px 48px rgba(0,0,0,0.2)',
    '0px 28px 56px rgba(0,0,0,0.25)',
    '0px 32px 64px rgba(0,0,0,0.25)',
    '0px 36px 72px rgba(0,0,0,0.3)',
    '0px 40px 80px rgba(0,0,0,0.3)',
    '0px 44px 88px rgba(0,0,0,0.35)',
    '0px 48px 96px rgba(0,0,0,0.35)',
    '0px 52px 104px rgba(0,0,0,0.4)',
    '0px 56px 112px rgba(0,0,0,0.4)',
    '0px 60px 120px rgba(0,0,0,0.45)',
    '0px 64px 128px rgba(0,0,0,0.45)',
    '0px 68px 136px rgba(0,0,0,0.5)',
    '0px 72px 144px rgba(0,0,0,0.5)',
    '0px 76px 152px rgba(0,0,0,0.55)',
    '0px 80px 160px rgba(0,0,0,0.55)',
    '0px 84px 168px rgba(0,0,0,0.6)',
    '0px 88px 176px rgba(0,0,0,0.6)',
    '0px 92px 184px rgba(0,0,0,0.65)',
  ],
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          textTransform: 'none',
          fontSize: '1rem',
          fontWeight: 600,
          padding: '10px 24px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            transform: 'translateY(-2px)',
          },
          transition: 'all 0.3s ease',
        },
        contained: {
          background: 'linear-gradient(45deg, #667eea, #764ba2)',
          '&:hover': {
            background: 'linear-gradient(45deg, #5a6fd8, #6a4190)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#667eea',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#667eea',
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backdropFilter: 'blur(10px)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(0,0,0,0.1)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

export default theme; 
import { createTheme } from '@mui/material/styles';

/**
 * Industrial-grade MUI theme for the Drawing Validation System.
 *
 * Design language:
 *   - Deep engineering blue as primary colour
 *   - Clean white cards with soft shadows (no heavy borders)
 *   - Inter typeface for modern readability
 *   - High-contrast green / red for PASS / FAIL indicators
 */
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0D47A1',
      light: '#1976D2',
      dark: '#0a2e6e',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#546E7A',
      contrastText: '#ffffff',
    },
    success: {
      main: '#2E7D32',
      light: '#4CAF50',
      contrastText: '#ffffff',
    },
    error: {
      main: '#C62828',
      light: '#EF5350',
      contrastText: '#ffffff',
    },
    background: {
      default: '#F0F2F5',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A2027',
      secondary: '#546E7A',
    },
    divider: 'rgba(0, 0, 0, 0.08)',
  },

  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700, letterSpacing: '-0.5px' },
    h5: { fontWeight: 600, letterSpacing: '-0.3px' },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500 },
    body1: { lineHeight: 1.6 },
    button: { fontWeight: 600, textTransform: 'none' },
    caption: { letterSpacing: '0.02em' },
  },

  shape: {
    borderRadius: 10,
  },

  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 6px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.07)',
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: { paddingBottom: 8 },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 20px',
          fontWeight: 600,
          lineHeight: 1.5,
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)',
          boxShadow: '0 4px 14px rgba(13, 71, 161, 0.30)',
          '&:hover': {
            background: 'linear-gradient(135deg, #1976D2 0%, #1565C0 100%)',
            boxShadow: '0 4px 18px rgba(13, 71, 161, 0.40)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600, borderRadius: 6 },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 4, height: 3 },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            fontWeight: 700,
            backgroundColor: '#F8F9FC',
            color: '#546E7A',
            fontSize: '0.70rem',
            textTransform: 'uppercase',
            letterSpacing: '0.09em',
            borderBottom: '2px solid rgba(0,0,0,0.07)',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(0,0,0,0.05)',
          padding: '10px 16px',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 8 },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
  },
});

export default theme;

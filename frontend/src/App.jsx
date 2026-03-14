import React from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './styles/theme';
import Dashboard from './pages/Dashboard';

/**
 * App — root component.
 * Wraps the whole application with the MUI ThemeProvider and CssBaseline
 * (which applies a consistent browser reset and background colour).
 */
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Dashboard />
    </ThemeProvider>
  );
}

export default App;

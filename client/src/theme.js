import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { main: '#41703f' },
    secondary: { main: '#dbb539' },
    warning: { main: '#ffe10f' },
    success: { main: '#789b3d' },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  spacing: 8,
  shape: {
    borderRadius: 24,
  },
});

export default theme;

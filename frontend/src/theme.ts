import { createTheme } from '@mui/material/styles';

// Brand palette (see docs/theme-guide.md)
const primaryMain = '#007BFF';
const primaryDark = '#0066CC';
const primaryLight = '#1F9CEF';
const secondaryMain = '#FF7A21';
const secondaryLight = '#FF8F45';
const secondaryDark = '#CC611A';
const navy = '#0B1D2E';
const softGray = '#F2F4F7';
const darkGray = '#4A4F57';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: primaryMain,
      dark: primaryDark,
      light: primaryLight,
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: secondaryMain,
      light: secondaryLight,
      dark: secondaryDark,
    },
    background: {
      default: softGray,
      paper: '#FFFFFF',
    },
    text: {
      primary: navy,
      secondary: darkGray,
    },
    success: {
      main: '#1F9CEF',
    },
    error: {
      main: '#E5484D',
    },
    warning: {
      main: '#FFA534',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 700,
    },
    h4: {
      fontWeight: 600,
      letterSpacing: '-0.02em',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          boxShadow: '0 6px 16px rgba(11, 29, 46, 0.06)',
          backgroundColor: '#FFFFFF',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          paddingInline: 18,
          fontWeight: 700,
          boxShadow: 'none',
        },
        containedPrimary: {
          backgroundImage: `linear-gradient(135deg, ${primaryMain}, ${primaryLight})`,
          boxShadow: '0 8px 18px rgba(0, 123, 255, 0.16)',
          ':hover': {
            backgroundImage: `linear-gradient(135deg, ${primaryDark}, ${primaryMain})`,
            boxShadow: '0 10px 22px rgba(0, 102, 204, 0.2)',
          },
          ':active': {
            transform: 'translateY(1px)',
            boxShadow: '0 6px 14px rgba(0, 102, 204, 0.18)',
          },
        },
        outlinedPrimary: {
          borderWidth: 2,
          paddingInline: 20,
        },
        containedSecondary: {
          backgroundColor: secondaryMain,
          color: '#FFFFFF',
          ':hover': {
            backgroundColor: secondaryDark,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          backgroundImage: 'linear-gradient(180deg, #ffffff 0%, #F8FAFE 100%)',
          boxShadow: '0 10px 26px rgba(11, 29, 46, 0.08)',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'filled',
      },
    },
    MuiFilledInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: '#EDF2F7',
          ':hover': {
            backgroundColor: '#E5EBF3',
          },
          '&.Mui-focused': {
            backgroundColor: '#E0E8F2',
            boxShadow: `0 0 0 3px rgba(0, 123, 255, 0.12)`,
          },
        },
        input: {
          paddingTop: 14,
          paddingBottom: 14,
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: softGray,
        },
      },
    },
  },
});

export default theme;

import { createTheme } from "@mui/material/styles";
import { red } from "@mui/material/colors";

/**
 * Burguer-Tenders theme — McDonald's-adjacent palette (red, yellow, white)
 * with Inter as the typeface and slightly rounded corners across the app.
 */
export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#da291c",
      dark: "#b71c1c",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#ffc300",
      dark: "#ffb300",
      contrastText: "#1a1a1a",
    },
    error: {
      main: red[700],
    },
    background: {
      default: "#fafafa",
      paper: "#ffffff",
    },
    text: {
      primary: "#1a1a1a",
      secondary: "#555555",
    },
  },
  typography: {
    fontFamily:
      '"Inter", system-ui, "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    h1: { fontWeight: 700, letterSpacing: "-0.02em" },
    h2: { fontWeight: 700, letterSpacing: "-0.02em" },
    h3: { fontWeight: 600, letterSpacing: "-0.015em" },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { fontWeight: 600, textTransform: "none", letterSpacing: 0 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        // Let our blurred restaurant photo (set on body::before in app.css)
        // shine through. Without this, CssBaseline paints an opaque
        // background.default color on top of it.
        body: {
          backgroundColor: "transparent",
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 999,
          paddingInline: "1.25rem",
          paddingBlock: "0.55rem",
        },
        sizeLarge: {
          paddingInline: "1.5rem",
          paddingBlock: "0.75rem",
          fontSize: "1rem",
        },
      },
    },
    MuiCard: {
      defaultProps: {
        elevation: 2,
      },
      styleOverrides: {
        root: {
          borderRadius: 16,
          overflow: "hidden",
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: "small",
        variant: "outlined",
        fullWidth: true,
      },
    },
    // Outlined inputs (TextField + Select use this internally) are
    // transparent by default; give them a solid white surface so they read
    // cleanly over the blurred restaurant photo backdrop.
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: "#ffffff",
          "&.Mui-disabled": {
            backgroundColor: "#f5f5f5",
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          "&.MuiFilledInput-root, &.MuiInput-root": {
            backgroundColor: "#ffffff",
          },
        },
      },
    },
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 16,
        },
      },
    },
  },
});

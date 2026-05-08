import { createTheme } from "@mui/material/styles";
import { red } from "@mui/material/colors";

/**
 * BeeTee's theme: late-night espresso surfaces with copper and amber
 * accents. The promo photos carry the bright food color; app chrome stays dark.
 */
export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#c77738",
      dark: "#8f461d",
      light: "#e0a15f",
      contrastText: "#140b07",
    },
    secondary: {
      main: "#f6c453",
      dark: "#bd8127",
      contrastText: "#160d08",
    },
    error: {
      main: red[700],
    },
    success: {
      main: "#5fbf7a",
      dark: "#36794a",
      contrastText: "#061009",
    },
    info: {
      main: "#d69a55",
      dark: "#8b562a",
      contrastText: "#140b07",
    },
    background: {
      default: "#0f0a07",
      paper: "#1b120d",
    },
    text: {
      primary: "#f7efe7",
      secondary: "#cdb9a7",
    },
    divider: "rgba(246, 196, 83, 0.16)",
  },
  typography: {
    fontFamily:
      '"Inter", system-ui, "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    h1: { fontWeight: 700, letterSpacing: 0 },
    h2: { fontWeight: 700, letterSpacing: 0 },
    h3: { fontWeight: 600, letterSpacing: 0 },
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
          boxShadow: "none",
          "&.MuiButton-containedPrimary": {
            backgroundImage:
              "linear-gradient(180deg, #d18644 0%, #a95725 100%)",
            color: "#120906",
            "&:hover": {
              backgroundImage:
                "linear-gradient(180deg, #e0a15f 0%, #b8642d 100%)",
            },
          },
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
          backgroundImage:
            "linear-gradient(180deg, rgba(43,27,18,0.98) 0%, rgba(25,16,12,0.98) 100%)",
          border: "1px solid rgba(246, 196, 83, 0.14)",
          boxShadow: "0 18px 44px rgba(0,0,0,0.32)",
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
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: "#241711",
          color: "#f7efe7",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(246, 196, 83, 0.22)",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(246, 196, 83, 0.45)",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#c77738",
          },
          "&.Mui-disabled": {
            backgroundColor: "#17100c",
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          "&.MuiFilledInput-root, &.MuiInput-root": {
            backgroundColor: "#241711",
          },
        },
      },
    },
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundImage:
            "linear-gradient(180deg, rgba(22,12,8,0.98) 0%, rgba(10,6,4,0.94) 100%)",
          borderBottom: "1px solid rgba(246, 196, 83, 0.16)",
          boxShadow: "0 14px 36px rgba(0,0,0,0.28)",
          backdropFilter: "blur(10px)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: "#1b120d",
          borderColor: "rgba(246, 196, 83, 0.16)",
        },
        rounded: {
          borderRadius: 16,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundImage:
            "linear-gradient(180deg, #1e140f 0%, #120b08 100%)",
          borderLeft: "1px solid rgba(246, 196, 83, 0.16)",
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: "#21150f",
          border: "1px solid rgba(246, 196, 83, 0.16)",
        },
      },
    },
  },
});

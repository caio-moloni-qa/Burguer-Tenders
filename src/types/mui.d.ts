/**
 * MUI v9 tightened slotProps typing — by default the override interfaces are
 * empty so passing `data-*`/`role`/`aria-*` attributes through `slotProps`
 * trips TS. Augment each slot we use so test selectors and a11y attributes
 * compile cleanly project-wide.
 */
import "@mui/material/Drawer";
import "@mui/material/Badge";
import "@mui/material/TextField";
import "@mui/material/Radio";

declare module "@mui/material/Drawer" {
  interface DrawerPaperSlotPropsOverrides {
    "data-testid"?: string;
    "data-action"?: string;
  }
  interface DrawerBackdropSlotPropsOverrides {
    "data-testid"?: string;
    "data-action"?: string;
  }
}

declare module "@mui/material/Badge" {
  interface BadgeBadgeSlotPropsOverrides {
    "data-testid"?: string;
    "aria-hidden"?: boolean;
  }
}

declare module "@mui/material/TextField" {
  interface TextFieldFormHelperTextSlotPropsOverrides {
    "data-testid"?: string;
    role?: string;
  }
}

declare module "@mui/material/Radio" {
  interface RadioInputSlotPropsOverrides {
    "data-testid"?: string;
  }
}

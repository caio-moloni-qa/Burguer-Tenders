import { AppBar, Container, Toolbar } from "@mui/material";
import { HeaderActions } from "./HeaderActions";
import { HeaderBrand } from "./HeaderBrand";

type HeaderProps = {
  /** When true, only the brand is rendered (used by the confirmation page). */
  brandOnly?: boolean;
};

export function Header({ brandOnly = false }: HeaderProps) {
  return (
    <AppBar position="sticky" color="primary">
      <Container maxWidth="lg" disableGutters>
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            gap: 2,
            py: { xs: 1, sm: 1.5 },
            px: { xs: 2, sm: 3 },
          }}
        >
          <HeaderBrand />
          {!brandOnly && <HeaderActions />}
        </Toolbar>
      </Container>
    </AppBar>
  );
}

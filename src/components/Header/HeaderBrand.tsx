import { Avatar, ButtonBase, Stack, Typography } from "@mui/material";
import { useCartStore } from "../../stores/cartStore";
import { useCheckoutStore } from "../../stores/checkoutStore";
import { useLocationStore } from "../../stores/locationStore";
import { useUiStore } from "../../stores/uiStore";

/** Logo + title — clicking it returns the user to the shop view from anywhere. */
export function HeaderBrand() {
  const setView = useUiStore((s) => s.setView);
  const closeCart = useCartStore((s) => s.closeDrawer);
  const closePanel = useLocationStore((s) => s.closePanel);
  const clearAllErrors = useCheckoutStore((s) => s.clearAllErrors);

  const goHome = () => {
    clearAllErrors();
    closeCart();
    closePanel();
    setView("shop");
  };

  return (
    <ButtonBase
      onClick={goHome}
      data-action="go-home"
      data-testid="header-home"
      aria-label="Burguer-Tenders — go to menu"
      focusRipple
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        px: 1,
        py: 0.5,
        borderRadius: 2,
        color: "primary.contrastText",
        textAlign: "left",
        "&:focus-visible": {
          outline: "2px solid",
          outlineColor: "secondary.main",
          outlineOffset: 2,
        },
      }}
    >
      <Avatar
        src="/images/logo.png"
        alt=""
        variant="rounded"
        data-testid="site-logo"
        sx={{
          width: 56,
          height: 56,
          bgcolor: "common.white",
          boxShadow: 3,
          border: "2px solid rgba(255,255,255,0.5)",
        }}
        slotProps={{ img: { decoding: "async" } }}
      />
      <Stack spacing={0} sx={{ minWidth: 0 }}>
        <Typography
          variant="h6"
          component="span"
          sx={{ fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.01em" }}
        >
          Burguer-Tenders
        </Typography>
        <Typography
          variant="caption"
          component="span"
          sx={{ opacity: 0.92, lineHeight: 1.3 }}
        >
          the best of both worlds
        </Typography>
      </Stack>
    </ButtonBase>
  );
}

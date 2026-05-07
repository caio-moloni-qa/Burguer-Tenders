import { Badge, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import ShoppingBagRoundedIcon from "@mui/icons-material/ShoppingBagRounded";
import { useCartStore, selectTotalItemCount } from "../../stores/cartStore";
import {
  selectHasDeliveryLocation,
  selectLocationSummary,
  useLocationStore,
} from "../../stores/locationStore";
import { t } from "../../i18n/locale";

export function HeaderActions() {
  const totalItems = useCartStore(selectTotalItemCount);
  const drawerOpen = useCartStore((s) => s.drawerOpen);
  const toggleCart = useCartStore((s) => s.toggleDrawer);
  const closeCart = useCartStore((s) => s.closeDrawer);

  const panelOpen = useLocationStore((s) => s.panelOpen);
  const togglePanel = useLocationStore((s) => s.togglePanel);
  const closePanel = useLocationStore((s) => s.closePanel);
  const located = useLocationStore(selectHasDeliveryLocation);
  const summary = useLocationStore(selectLocationSummary);

  const handleToggleLocation = () => {
    if (drawerOpen) {
      closeCart();
    }
    togglePanel();
  };

  const handleToggleCart = () => {
    if (panelOpen) {
      closePanel();
    }
    toggleCart();
  };

  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
      {located && summary && (
        <Typography
          variant="caption"
          data-testid="location-summary"
          title={summary}
          sx={{
            color: "primary.contrastText",
            opacity: 0.92,
            maxWidth: { xs: "11rem", sm: "14rem" },
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            display: { xs: "none", sm: "block" },
          }}
        >
          {summary}
        </Typography>
      )}
      <Tooltip
        title={panelOpen ? t("headerCloseLocation") : t("headerOpenLocation")}
      >
        <IconButton
          onClick={handleToggleLocation}
          data-action="toggle-location"
          data-testid="location-toggle"
          aria-expanded={panelOpen}
          aria-label={
            panelOpen ? t("headerCloseLocation") : t("headerOpenLocation")
          }
          sx={{ color: "primary.contrastText" }}
        >
          <Badge
            color="secondary"
            variant="dot"
            invisible={!located}
            data-testid="location-set-indicator"
            slotProps={{ badge: { "aria-hidden": !located } }}
          >
            <LocationOnRoundedIcon />
          </Badge>
        </IconButton>
      </Tooltip>
      <Tooltip title={drawerOpen ? t("headerCloseCart") : t("headerOpenCart")}>
        <IconButton
          onClick={handleToggleCart}
          data-action="toggle-cart"
          data-testid="cart-toggle"
          aria-expanded={drawerOpen}
          aria-label={drawerOpen ? t("headerCloseCart") : t("headerOpenCart")}
          sx={{ color: "primary.contrastText" }}
        >
          <Badge
            badgeContent={totalItems}
            color="secondary"
            showZero
            slotProps={{
              badge: {
                "data-testid": "cart-count",
                "aria-hidden": totalItems === 0,
              },
            }}
            sx={{
              "& .MuiBadge-badge": {
                fontWeight: 700,
                color: "secondary.contrastText",
              },
            }}
          >
            <ShoppingBagRoundedIcon />
          </Badge>
        </IconButton>
      </Tooltip>
    </Stack>
  );
}

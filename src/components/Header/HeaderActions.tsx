import { Badge, Box, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import ShoppingBagRoundedIcon from "@mui/icons-material/ShoppingBagRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import { getStoreDisplayName } from "../../data/stores";
import { useAuthStore } from "../../stores/authStore";
import { useCartStore, selectTotalItemCount } from "../../stores/cartStore";
import {
  selectHasDeliveryLocation,
  useLocationStore,
} from "../../stores/locationStore";
import { useUiStore } from "../../stores/uiStore";
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
  const storeId = useLocationStore((s) => s.delivery.storeId);
  const storeName = storeId ? getStoreDisplayName(storeId) : "";
  const user = useAuthStore((s) => s.user);
  const setView = useUiStore((s) => s.setView);

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

  const handleProfile = () => {
    closeCart();
    closePanel();
    setView(user ? "profile" : "login");
  };

  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
      {located && storeName && (
        <Box
          data-testid="menu-store-banner"
          title={`${t("menuOrderingFrom")} ${storeName}`}
          sx={{
            display: { xs: "none", md: "inline-flex" },
            alignItems: "center",
            gap: 0.75,
            minHeight: 34,
            maxWidth: { md: "18rem", lg: "24rem" },
            px: 1.25,
            border: "1px solid",
            borderColor: "rgba(246, 196, 83, 0.24)",
            borderRadius: 999,
            bgcolor: "rgba(38, 24, 16, 0.72)",
            color: "common.white",
            boxShadow: "0 8px 20px rgba(0,0,0,0.18)",
          }}
        >
          <StorefrontRoundedIcon sx={{ fontSize: 18, color: "secondary.main", flexShrink: 0 }} />
          <Typography
            variant="caption"
            component="span"
            sx={{
              minWidth: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              fontWeight: 600,
            }}
          >
            <Box component="span" sx={{ opacity: 0.78 }}>
              {t("menuOrderingFrom")}{" "}
            </Box>
            <Box component="strong" sx={{ color: "secondary.main", fontWeight: 800 }}>
              {storeName}
            </Box>
          </Typography>
        </Box>
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
          sx={{ color: "common.white" }}
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
      <Tooltip title={user ? t("authProfile") : t("authLogin")}>
        <IconButton
          onClick={handleProfile}
          data-testid="profile-toggle"
          aria-label={user ? t("authProfile") : t("authLogin")}
          sx={{ color: "common.white" }}
        >
          <AccountCircleRoundedIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title={drawerOpen ? t("headerCloseCart") : t("headerOpenCart")}>
        <IconButton
          onClick={handleToggleCart}
          data-action="toggle-cart"
          data-testid="cart-toggle"
          aria-expanded={drawerOpen}
          aria-label={drawerOpen ? t("headerCloseCart") : t("headerOpenCart")}
          sx={{ color: "common.white" }}
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

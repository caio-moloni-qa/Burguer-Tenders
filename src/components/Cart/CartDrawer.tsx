import { useMemo } from "react";
import {
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  Stack,
  Typography,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ShoppingCartCheckoutRoundedIcon from "@mui/icons-material/ShoppingCartCheckoutRounded";
import {
  getCartLines,
  selectSubtotal,
  selectTotalItemCount,
  useCartStore,
} from "../../stores/cartStore";
import {
  selectHasDeliveryLocation,
  useLocationStore,
} from "../../stores/locationStore";
import { useUiStore } from "../../stores/uiStore";
import { useCheckoutStore } from "../../stores/checkoutStore";
import { formatPrice, t } from "../../i18n/locale";
import { CartLine } from "./CartLine";

const CHECKOUT_TRANSITION_MS = 750;

export function CartDrawer() {
  const drawerOpen = useCartStore((s) => s.drawerOpen);
  const closeDrawer = useCartStore((s) => s.closeDrawer);
  const linesById = useCartStore((s) => s.linesById);
  const lines = useMemo(() => getCartLines(linesById), [linesById]);
  const subtotal = useCartStore(selectSubtotal);
  const totalItems = useCartStore(selectTotalItemCount);

  const located = useLocationStore(selectHasDeliveryLocation);
  const openPanel = useLocationStore((s) => s.openPanel);
  const savedZip = useLocationStore((s) => s.delivery.zipCode);

  const setView = useUiStore((s) => s.setView);
  const showPageSpinner = useUiStore((s) => s.showPageSpinner);
  const hidePageSpinner = useUiStore((s) => s.hidePageSpinner);

  const checkoutZip = useCheckoutStore((s) => s.form.zipCode);
  const setCheckoutField = useCheckoutStore((s) => s.setField);

  const handleGoToCheckout = () => {
    if (!located) {
      closeDrawer();
      openPanel();
      return;
    }
    if (totalItems === 0) {
      return;
    }
    closeDrawer();
    showPageSpinner();
    window.setTimeout(() => {
      if (!checkoutZip.trim() && savedZip.trim()) {
        setCheckoutField("zipCode", savedZip);
      }
      setView("checkout");
      hidePageSpinner();
    }, CHECKOUT_TRANSITION_MS);
  };

  return (
    <Drawer
      anchor="right"
      open={drawerOpen}
      onClose={closeDrawer}
      slotProps={{
        paper: {
          "data-testid": "cart-drawer",
          sx: {
            width: { xs: "100vw", sm: 420 },
            display: "flex",
            flexDirection: "column",
          },
        },
        backdrop: {
          // The backdrop click closes the drawer (MUI default), preserve a
          // testable hook so the close action stays selectable.
          "data-action": "close-cart",
        },
      }}
    >
      <Stack
        direction="row"
        sx={{
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          py: 1.5,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography variant="h6" id="cart-drawer-title" sx={{ fontWeight: 700 }}>
          {t("cartTitle")}
        </Typography>
        <IconButton
          onClick={closeDrawer}
          aria-label="Close cart"
          data-action="close-cart"
        >
          <CloseRoundedIcon />
        </IconButton>
      </Stack>

      <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
        {lines.length === 0 ? (
          <Typography
            variant="body2"
            color="text.secondary"
            data-testid="cart-empty"
            sx={{ p: 3, textAlign: "center" }}
          >
            {t("cartEmpty")}
          </Typography>
        ) : (
          <List
            disablePadding
            data-testid="cart-lines"
            aria-labelledby="cart-drawer-title"
          >
            {lines.map((line) => (
              <CartLine key={line.productId} line={line} />
            ))}
          </List>
        )}
      </Box>

      <Divider />
      <Box sx={{ px: 2, py: 2 }}>
        <Stack
          direction="row"
          sx={{
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1.5,
          }}
        >
          <Typography variant="subtitle2" color="text.secondary">
            {t("cartSubtotal")}
          </Typography>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700 }}
            data-testid="cart-subtotal"
          >
            {formatPrice(subtotal)}
          </Typography>
        </Stack>
        <Button
          variant="contained"
          color="primary"
          size="large"
          fullWidth
          startIcon={<ShoppingCartCheckoutRoundedIcon />}
          disabled={lines.length === 0}
          onClick={handleGoToCheckout}
          data-action="go-checkout"
          data-testid="go-checkout"
        >
          {t("cartGoToCheckout")}
        </Button>
      </Box>
    </Drawer>
  );
}

import { useCallback } from "react";
import { Backdrop, CircularProgress } from "@mui/material";
import { useCartStore } from "./stores/cartStore";
import { useLocationStore } from "./stores/locationStore";
import { useUiStore } from "./stores/uiStore";
import { useContentBootstrap } from "./hooks/useContentBootstrap";
import { useEscapeKey } from "./hooks/useEscapeKey";
import { useInitialDelivery } from "./hooks/useInitialDelivery";
import { CartDrawer } from "./components/Cart/CartDrawer";
import { CheckoutPage } from "./components/Checkout/CheckoutPage";
import { ConfirmationPage } from "./components/Confirmation/ConfirmationPage";
import { LocationDrawer } from "./components/Location/LocationDrawer";
import { ItemCustomizerDialog } from "./components/Menu/ItemCustomizerDialog";
import { MenuPage } from "./components/Menu/MenuPage";
import { PageSpinner } from "./components/feedback/PageSpinner";
import { Toast } from "./components/feedback/Toast";

export function App() {
  const contentReady = useContentBootstrap();
  const view = useUiStore((s) => s.view);
  useUiStore((s) => s.localeVersion);

  const cartOpen = useCartStore((s) => s.drawerOpen);
  const closeCart = useCartStore((s) => s.closeDrawer);
  const panelOpen = useLocationStore((s) => s.panelOpen);
  const closePanel = useLocationStore((s) => s.closePanel);
  const setPendingAddProductId = useUiStore((s) => s.setPendingAddProductId);

  useInitialDelivery();

  // Body scroll-lock is handled automatically by MUI's Drawer (and Modal portal),
  // so the legacy `body.cart-open` class is no longer needed.

  const handleEscape = useCallback(() => {
    if (panelOpen) {
      setPendingAddProductId(null);
      closePanel();
      return;
    }
    if (cartOpen) {
      closeCart();
    }
  }, [panelOpen, cartOpen, closePanel, closeCart, setPendingAddProductId]);

  useEscapeKey(handleEscape);

  if (!contentReady) {
    return (
      <Backdrop
        open
        aria-label="Loading content"
        sx={{
          color: "primary.contrastText",
          zIndex: (theme) => theme.zIndex.modal + 10,
          backgroundColor: "rgba(8, 5, 3, 0.74)",
          backdropFilter: "blur(2px)",
        }}
      >
        <CircularProgress color="secondary" thickness={4.5} size={56} />
      </Backdrop>
    );
  }

  return (
    <>
      {view === "checkout" && <CheckoutPage />}
      {view === "confirmation" && <ConfirmationPage />}
      {view === "shop" && <MenuPage />}
      {view !== "confirmation" && (
        <>
          <CartDrawer />
          <LocationDrawer />
          <ItemCustomizerDialog />
        </>
      )}
      <Toast />
      <PageSpinner />
    </>
  );
}

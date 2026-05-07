import { useCallback } from "react";
import { useCartStore } from "./stores/cartStore";
import { useLocationStore } from "./stores/locationStore";
import { useUiStore } from "./stores/uiStore";
import { useEscapeKey } from "./hooks/useEscapeKey";
import { useInitialDelivery } from "./hooks/useInitialDelivery";
import { CartDrawer } from "./components/Cart/CartDrawer";
import { CheckoutPage } from "./components/Checkout/CheckoutPage";
import { ConfirmationPage } from "./components/Confirmation/ConfirmationPage";
import { LocationDrawer } from "./components/Location/LocationDrawer";
import { MenuPage } from "./components/Menu/MenuPage";
import { PageSpinner } from "./components/feedback/PageSpinner";
import { Toast } from "./components/feedback/Toast";

export function App() {
  const view = useUiStore((s) => s.view);

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

  return (
    <>
      {view === "checkout" && <CheckoutPage />}
      {view === "confirmation" && <ConfirmationPage />}
      {view === "shop" && <MenuPage />}
      {view !== "confirmation" && (
        <>
          <CartDrawer />
          <LocationDrawer />
        </>
      )}
      <Toast />
      <PageSpinner />
    </>
  );
}

import type { FormEvent } from "react";
import { Button, Container, Stack, Typography } from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import { useCartStore } from "../../stores/cartStore";
import { useCheckoutStore } from "../../stores/checkoutStore";
import { useLocationStore } from "../../stores/locationStore";
import { useUiStore } from "../../stores/uiStore";
import {
  checkoutFieldFocusId,
  validateCheckout,
} from "../../checkout/validateCheckout";
import { t } from "../../i18n/locale";
import { Header } from "../Header/Header";
import { DeliverySection } from "./DeliverySection";
import { OrderSummary } from "./OrderSummary";
import { PaymentSection } from "./PaymentSection";
import { PersonalDetailsSection } from "./PersonalDetailsSection";

export function CheckoutPage() {
  const setView = useUiStore((s) => s.setView);
  const clearCart = useCartStore((s) => s.clear);
  const closeCart = useCartStore((s) => s.closeDrawer);
  const closePanel = useLocationStore((s) => s.closePanel);
  const savedZip = useLocationStore((s) => s.delivery.zipCode);

  const form = useCheckoutStore((s) => s.form);
  const setErrors = useCheckoutStore((s) => s.setErrors);
  const clearAllErrors = useCheckoutStore((s) => s.clearAllErrors);
  const setConfirmedUserName = useCheckoutStore((s) => s.setConfirmedUserName);

  const handleBack = () => {
    clearAllErrors();
    closeCart();
    closePanel();
    setView("shop");
  };

  const handleSubmit = (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const result = validateCheckout(form, savedZip);
    if (!result.valid) {
      setErrors(result.errors);
      const focusId = result.firstFocusField
        ? checkoutFieldFocusId[result.firstFocusField]
        : undefined;
      if (focusId) {
        requestAnimationFrame(() => {
          document.getElementById(focusId)?.focus();
        });
      }
      return;
    }

    setConfirmedUserName(form.fullName.trim());
    clearCart();
    setView("confirmation");
  };

  return (
    <>
      <Header />
      <Container
        component="main"
        maxWidth="md"
        sx={{ py: { xs: 3, md: 4 } }}
        data-testid="checkout-page"
      >
        <Button
          variant="text"
          startIcon={<ArrowBackRoundedIcon />}
          onClick={handleBack}
          data-action="back-to-shop"
          data-testid="back-to-shop"
          sx={{ mb: 2 }}
        >
          {t("checkoutBackToMenu")}
        </Button>
        <Typography variant="h4" component="h2" sx={{ mb: 3, fontWeight: 700 }}>
          {t("checkoutTitle")}
        </Typography>
        <Stack
          component="form"
          id="checkout-form"
          data-testid="checkout-form"
          noValidate
          spacing={2.5}
          onSubmit={handleSubmit}
        >
          <PersonalDetailsSection />
          <DeliverySection />
          <PaymentSection />
          <OrderSummary />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            startIcon={<LockRoundedIcon />}
            data-testid="place-order"
            sx={{ alignSelf: { xs: "stretch", sm: "flex-end" }, px: 4 }}
          >
            {t("checkoutPlaceOrder")}
          </Button>
        </Stack>
      </Container>
    </>
  );
}

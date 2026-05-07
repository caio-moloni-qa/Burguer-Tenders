import {
  Box,
  FormControlLabel,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CreditCardRoundedIcon from "@mui/icons-material/CreditCardRounded";
import StoreRoundedIcon from "@mui/icons-material/StoreRounded";
import { useCheckoutStore, type PaymentMethod } from "../../stores/checkoutStore";
import {
  formatCardCvc,
  formatCardExpiry,
  formatCardName,
  formatCardNumber,
} from "../../checkout/formatters";
import { t } from "../../i18n/locale";

export function PaymentSection() {
  const paymentMethod = useCheckoutStore((s) => s.form.paymentMethod);
  const cardName = useCheckoutStore((s) => s.form.cardNameOnCard);
  const cardNumber = useCheckoutStore((s) => s.form.cardNumber);
  const cardExpiry = useCheckoutStore((s) => s.form.cardExpiry);
  const cardCvc = useCheckoutStore((s) => s.form.cardCvc);
  const errors = useCheckoutStore((s) => s.errors);
  const setField = useCheckoutStore((s) => s.setField);
  const clearError = useCheckoutStore((s) => s.clearError);

  const showCardFields = paymentMethod === "card";

  const handlePaymentChange = (method: PaymentMethod) => {
    setField("paymentMethod", method);
    if (method === "pay-in-restaurant") {
      ["cardNameOnCard", "cardNumber", "cardExpiry", "cardCvc"].forEach(clearError);
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 2.5 }}>
      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 700 }}>
        {t("checkoutSectionPayment")}
      </Typography>
      <RadioGroup
        value={paymentMethod}
        onChange={(_, value) => handlePaymentChange(value as PaymentMethod)}
        aria-label="Payment method"
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          sx={{ mb: 2 }}
        >
          <Paper
            variant="outlined"
            sx={{
              flex: 1,
              borderColor: paymentMethod === "card" ? "primary.main" : "divider",
              transition: "border-color 120ms",
            }}
          >
            <FormControlLabel
              value="card"
              sx={{ width: "100%", m: 0, px: 2, py: 1 }}
              control={
                <Radio
                  data-checkout-payment
                  slotProps={{ input: { "data-testid": "payment-card" } }}
                />
              }
              label={
                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                  <CreditCardRoundedIcon fontSize="small" />
                  <span>{t("checkoutPayCard")}</span>
                </Stack>
              }
            />
          </Paper>
          <Paper
            variant="outlined"
            sx={{
              flex: 1,
              borderColor:
                paymentMethod === "pay-in-restaurant"
                  ? "primary.main"
                  : "divider",
              transition: "border-color 120ms",
            }}
          >
            <FormControlLabel
              value="pay-in-restaurant"
              sx={{ width: "100%", m: 0, px: 2, py: 1 }}
              control={
                <Radio
                  data-checkout-payment
                  slotProps={{ input: { "data-testid": "payment-restaurant" } }}
                />
              }
              label={
                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                  <StoreRoundedIcon fontSize="small" />
                  <span>{t("checkoutPayRestaurant")}</span>
                </Stack>
              }
            />
          </Paper>
        </Stack>
      </RadioGroup>

      <Box hidden={!showCardFields} data-testid="card-details">
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: "block" }}>
          {t("checkoutCardDetails")}
        </Typography>
        <Stack spacing={2}>
          <CardField
            id="checkout-card-name"
            field="cardNameOnCard"
            ariaLabel={t("checkoutCardName")}
            placeholder={t("checkoutCardName")}
            value={cardName}
            error={errors.cardNameOnCard}
            autoComplete="cc-name"
            onChange={(v) => setField("cardNameOnCard", formatCardName(v))}
          />
          <CardField
            id="checkout-card-number"
            field="cardNumber"
            ariaLabel={t("checkoutCardNumber")}
            value={cardNumber}
            error={errors.cardNumber}
            autoComplete="cc-number"
            inputMode="numeric"
            maxLength={23}
            placeholder="1234 5678 9012 3456"
            onChange={(v) => setField("cardNumber", formatCardNumber(v))}
          />
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <CardField
              id="checkout-card-expiry"
              field="cardExpiry"
              ariaLabel={t("checkoutExpiry")}
              value={cardExpiry}
              error={errors.cardExpiry}
              autoComplete="cc-exp"
              inputMode="numeric"
              maxLength={7}
              placeholder="MM / YY"
              onChange={(v) => setField("cardExpiry", formatCardExpiry(v))}
            />
            <CardField
              id="checkout-card-cvc"
              field="cardCvc"
              ariaLabel={t("checkoutSecurityCode")}
              value={cardCvc}
              error={errors.cardCvc}
              type="password"
              autoComplete="cc-csc"
              inputMode="numeric"
              maxLength={4}
              placeholder="CVC"
              onChange={(v) => setField("cardCvc", formatCardCvc(v))}
            />
          </Stack>
        </Stack>
      </Box>
    </Paper>
  );
}

type CardFieldProps = {
  id: string;
  field: string;
  ariaLabel: string;
  value: string;
  error: string | undefined;
  onChange: (raw: string) => void;
  type?: string;
  inputMode?: "text" | "numeric";
  autoComplete?: string;
  maxLength?: number;
  placeholder?: string;
};

function CardField({
  id,
  field,
  ariaLabel,
  value,
  error,
  onChange,
  type = "text",
  inputMode,
  autoComplete,
  maxLength,
  placeholder,
}: CardFieldProps) {
  return (
    <TextField
      id={id}
      name={field}
      type={type}
      value={value}
      placeholder={placeholder}
      error={Boolean(error)}
      helperText={error}
      onChange={(e) => onChange(e.target.value)}
      slotProps={{
        htmlInput: {
          "data-checkout-field": field,
          "data-testid": id,
          "aria-label": ariaLabel,
          inputMode,
          autoComplete,
          maxLength,
        },
        formHelperText: error
          ? {
              role: "alert",
              "data-testid": `checkout-error-${field}`,
            }
          : undefined,
      }}
    />
  );
}

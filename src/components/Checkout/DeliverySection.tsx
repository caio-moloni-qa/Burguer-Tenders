import { Box, Chip, Paper, Stack, Typography } from "@mui/material";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import { getStoreDisplayName } from "../../data/stores";
import { useLocationStore } from "../../stores/locationStore";
import { useCheckoutStore } from "../../stores/checkoutStore";
import { t } from "../../i18n/locale";

type SummaryRowProps = {
  label: string;
  value: string;
  testId: string;
};

function SummaryRow({ label, value, testId }: SummaryRowProps) {
  if (!value.trim()) {
    return null;
  }
  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          display: "block",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          fontWeight: 600,
        }}
      >
        {label}
      </Typography>
      <Typography variant="body2" data-testid={testId} sx={{ fontWeight: 500 }}>
        {value}
      </Typography>
    </Box>
  );
}

export function DeliverySection() {
  const delivery = useLocationStore((s) => s.delivery);
  const formZip = useCheckoutStore((s) => s.form.zipCode);

  const cityState = [delivery.city, delivery.state].filter(Boolean).join(", ");
  const storeName = delivery.storeId ? getStoreDisplayName(delivery.storeId) : "";
  const zipValue = formZip.trim() !== "" ? formZip : delivery.zipCode;

  return (
    <Paper variant="outlined" sx={{ p: 2.5 }}>
      <Stack
        direction="row"
        sx={{
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {t("checkoutSectionDelivery")}
        </Typography>
        {storeName && (
          <Chip
            icon={<StorefrontRoundedIcon />}
            label={storeName}
            color="primary"
            variant="outlined"
            size="small"
            data-testid="checkout-store-name"
          />
        )}
      </Stack>
      <Stack spacing={1.5}>
        <SummaryRow
          testId="checkout-zip"
          label={t("checkoutZip")}
          value={zipValue}
        />
        <SummaryRow
          testId="checkout-street"
          label={t("checkoutStreet")}
          value={delivery.streetLine}
        />
        <SummaryRow
          testId="checkout-neighborhood"
          label={t("checkoutNeighborhood")}
          value={delivery.neighborhood}
        />
        <SummaryRow
          testId="checkout-city-state"
          label={t("checkoutCityState")}
          value={cityState}
        />
        <SummaryRow
          testId="checkout-country"
          label={t("checkoutCountry")}
          value={delivery.country}
        />
        <SummaryRow
          testId="checkout-complement"
          label={t("checkoutComplement")}
          value={delivery.complement}
        />
      </Stack>
    </Paper>
  );
}

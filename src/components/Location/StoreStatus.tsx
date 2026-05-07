import { Alert } from "@mui/material";
import { resolveStoreForDelivery } from "../../data/stores";
import { t } from "../../i18n/locale";

type Props = {
  countryCode: string;
  city: string;
  state: string;
};

export function StoreStatus({ countryCode, city, state }: Props) {
  const resolved = resolveStoreForDelivery({ countryCode, city, state });
  const hasCityState = city.trim().length > 0 && state.trim().length > 0;

  if (resolved) {
    return (
      <Alert
        severity="success"
        variant="outlined"
        data-testid="location-store-status"
        sx={{ borderRadius: 2 }}
      >
        {t("locationStoreAvailable", { store: resolved.displayName })}
      </Alert>
    );
  }

  if (hasCityState) {
    return (
      <Alert
        severity="warning"
        variant="outlined"
        data-testid="location-store-status"
        role="status"
        sx={{ borderRadius: 2 }}
      >
        {t("locationStoreUnavailable")}
      </Alert>
    );
  }

  return (
    <Alert
      severity="info"
      variant="outlined"
      data-testid="location-store-status"
      sx={{ borderRadius: 2 }}
    >
      {t("locationStoreHint")}
    </Alert>
  );
}

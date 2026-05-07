import { Alert } from "@mui/material";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import { getStoreDisplayName } from "../../data/stores";
import { useLocationStore } from "../../stores/locationStore";
import { t } from "../../i18n/locale";

export function StoreBanner() {
  const storeId = useLocationStore((s) => s.delivery.storeId);
  if (!storeId.trim()) {
    return null;
  }
  return (
    <Alert
      icon={<StorefrontRoundedIcon fontSize="inherit" />}
      severity="info"
      data-testid="menu-store-banner"
      sx={{
        mb: 2,
        bgcolor: "#fff4d6",
        color: "text.primary",
        border: "1px solid",
        borderColor: "rgba(218, 41, 28, 0.35)",
        boxShadow: 1,
        "& .MuiAlert-icon": { color: "primary.main" },
      }}
    >
      {t("menuOrderingFrom")}{" "}
      <strong style={{ color: "#b71c1c" }}>{getStoreDisplayName(storeId)}</strong>
    </Alert>
  );
}

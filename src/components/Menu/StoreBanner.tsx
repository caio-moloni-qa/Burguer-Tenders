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
        bgcolor: "rgba(38, 24, 16, 0.92)",
        color: "text.primary",
        border: "1px solid",
        borderColor: "rgba(246, 196, 83, 0.24)",
        boxShadow: "0 14px 30px rgba(0,0,0,0.28)",
        "& .MuiAlert-icon": { color: "secondary.main" },
      }}
    >
      {t("menuOrderingFrom")}{" "}
      <strong style={{ color: "#f6c453" }}>{getStoreDisplayName(storeId)}</strong>
    </Alert>
  );
}

import { useEffect, useState } from "react";
import { Alert, Snackbar } from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { useUiStore } from "../../stores/uiStore";
import { t } from "../../i18n/locale";

const HIDE_AFTER_MS = 2500;

export function Toast() {
  const itemName = useUiStore((s) => s.toastItemName);
  const version = useUiStore((s) => s.toastVersion);
  const hideToast = useUiStore((s) => s.hideToast);

  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!itemName) {
      return;
    }
    setMessage(t("toastAddedToCart", { item: itemName }));
    setOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version]);

  const handleClose = () => {
    setOpen(false);
    hideToast();
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={HIDE_AFTER_MS}
      onClose={handleClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      slotProps={{
        transition: { appear: true },
      }}
    >
      <Alert
        onClose={handleClose}
        severity="success"
        variant="filled"
        iconMapping={{ success: <CheckCircleRoundedIcon /> }}
        data-testid="cart-toast"
        sx={{ width: "100%", borderRadius: 2, fontWeight: 600 }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}

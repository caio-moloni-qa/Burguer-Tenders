import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import ShoppingBagRoundedIcon from "@mui/icons-material/ShoppingBagRounded";
import { t } from "../../i18n/locale";
import { useAuthStore } from "../../stores/authStore";
import { useCartStore } from "../../stores/cartStore";

export function ReorderPrompt() {
  const user = useAuthStore((s) => s.user);
  const orders = useAuthStore((s) => s.orders);
  const dismissed = useAuthStore((s) => s.reorderPromptDismissed);
  const dismiss = useAuthStore((s) => s.dismissReorderPrompt);
  const addCustomizedProduct = useCartStore((s) => s.addCustomizedProduct);
  const order = orders[0];

  const handleReorder = () => {
    if (order) {
      for (const line of order.lines) {
        addCustomizedProduct(line);
      }
    }
    dismiss();
  };

  return (
    <Dialog open={Boolean(user && order && !dismissed)} onClose={dismiss}>
      <DialogTitle>{t("authReorderPrompt")}</DialogTitle>
      <DialogContent />
      <DialogActions>
        <Button onClick={dismiss}>{t("authMaybeLater")}</Button>
        <Button
          variant="contained"
          startIcon={<ShoppingBagRoundedIcon />}
          onClick={handleReorder}
        >
          {t("authReorder")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

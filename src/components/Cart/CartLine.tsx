import {
  Box,
  IconButton,
  ListItem,
  Stack,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import type { CartLine as CartLineType } from "../../stores/cartStore";
import { useCartStore } from "../../stores/cartStore";
import { getProductById } from "../../data/products";
import { formatPrice, t } from "../../i18n/locale";

type Props = {
  line: CartLineType;
};

export function CartLine({ line }: Props) {
  const product = getProductById(line.productId);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeLine = useCartStore((s) => s.removeLine);

  if (!product) {
    return null;
  }

  const lineTotal = line.unitPriceUsd * line.quantity;

  return (
    <ListItem
      disableGutters
      data-product-id={line.productId}
      data-cart-line-id={line.id}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        gap: 1,
        px: 2,
        py: 1.5,
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Stack
        direction="row"
        sx={{ alignItems: "flex-start", justifyContent: "space-between" }}
      >
        <Box sx={{ minWidth: 0, pr: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {product.shortName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatPrice(line.unitPriceUsd)} {t("cartEach")}
          </Typography>
          {line.customizationSummary.length > 0 && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 0.25 }}
              data-testid="cart-line-customizations"
            >
              {line.customizationSummary.join(", ")}
            </Typography>
          )}
        </Box>
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 700 }}
          data-testid="line-total"
        >
          {formatPrice(lineTotal)}
        </Typography>
      </Stack>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
        <IconButton
          size="small"
          onClick={() => setQuantity(line.id, line.quantity - 1)}
          data-action="dec-line"
          data-product-id={line.productId}
          aria-label={`Decrease ${product.shortName}`}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1.5,
          }}
        >
          <RemoveRoundedIcon fontSize="small" />
        </IconButton>
        <Typography
          variant="subtitle2"
          sx={{ minWidth: 24, textAlign: "center", fontWeight: 600 }}
          data-testid="cart-line-qty"
        >
          {line.quantity}
        </Typography>
        <IconButton
          size="small"
          onClick={() => setQuantity(line.id, line.quantity + 1)}
          data-action="inc-line"
          data-product-id={line.productId}
          aria-label={`Increase ${product.shortName}`}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1.5,
          }}
        >
          <AddRoundedIcon fontSize="small" />
        </IconButton>
        <Box sx={{ flexGrow: 1 }} />
        <IconButton
          size="small"
          color="error"
          onClick={() => removeLine(line.id)}
          data-action="remove-line"
          data-product-id={line.productId}
          aria-label={`${t("cartRemove")} ${product.shortName}`}
        >
          <DeleteOutlineRoundedIcon fontSize="small" />
        </IconButton>
      </Stack>
    </ListItem>
  );
}

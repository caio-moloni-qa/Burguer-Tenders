import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from "@mui/material";
import AddShoppingCartRoundedIcon from "@mui/icons-material/AddShoppingCartRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import { getProductById } from "../../data/products";
import { useCartStore } from "../../stores/cartStore";
import { useUiStore } from "../../stores/uiStore";
import { formatPrice, t, type TranslationKey } from "../../i18n/locale";
import type { Product } from "../../types/product";

type ExtraOption = {
  id: string;
  labelKey: TranslationKey;
  priceUsd: number;
};

const BURGER_EXTRAS: ExtraOption[] = [
  { id: "everything-style", labelKey: "customizerExtraEverything", priceUsd: 1.75 },
  { id: "extra-cheese", labelKey: "customizerExtraCheese", priceUsd: 0.75 },
  { id: "bacon", labelKey: "customizerExtraBacon", priceUsd: 1.25 },
  { id: "grilled-onions", labelKey: "customizerExtraGrilledOnions", priceUsd: 0.5 },
  { id: "jalapenos", labelKey: "customizerExtraJalapenos", priceUsd: 0.5 },
];

const TENDER_EXTRAS: ExtraOption[] = [
  { id: "extra-sauce", labelKey: "customizerExtraSauce", priceUsd: 0.5 },
  { id: "spicy-dust", labelKey: "customizerExtraSpicyDust", priceUsd: 0.5 },
  { id: "large-pack", labelKey: "customizerExtraLargePack", priceUsd: 3 },
];

const COMBO_EXTRAS: ExtraOption[] = [
  { id: "large-drink", labelKey: "customizerExtraLargeDrink", priceUsd: 1 },
  { id: "loaded-fries", labelKey: "customizerExtraLoadedFries", priceUsd: 1.5 },
  { id: "extra-sauce", labelKey: "customizerExtraSauce", priceUsd: 0.5 },
];

const SIDE_EXTRAS: ExtraOption[] = [
  { id: "large-size", labelKey: "customizerExtraLargeSize", priceUsd: 1.5 },
  { id: "extra-seasoning", labelKey: "customizerExtraSeasoning", priceUsd: 0.5 },
  { id: "dipping-sauce", labelKey: "customizerExtraDippingSauce", priceUsd: 0.5 },
];

const DRINK_EXTRAS: ExtraOption[] = [
  { id: "large-size", labelKey: "customizerExtraLargeSize", priceUsd: 1 },
  { id: "no-ice", labelKey: "customizerExtraNoIce", priceUsd: 0 },
];

function optionsForProduct(product: Product): ExtraOption[] {
  switch (product.category) {
    case "burger":
      return BURGER_EXTRAS;
    case "tenders":
      return TENDER_EXTRAS;
    case "combo":
      return COMBO_EXTRAS;
    case "drink":
      return DRINK_EXTRAS;
    case "side":
      return SIDE_EXTRAS;
  }
}

export function ItemCustomizerDialog() {
  const productId = useUiStore((s) => s.customizerProductId);
  const closeCustomizer = useUiStore((s) => s.closeCustomizer);
  const showToast = useUiStore((s) => s.showToast);
  const addCustomizedProduct = useCartStore((s) => s.addCustomizedProduct);

  const product = productId ? getProductById(productId) : undefined;
  const [pattyCount, setPattyCount] = useState(1);
  const [selectedExtras, setSelectedExtras] = useState<Record<string, boolean>>({});
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setPattyCount(1);
    setSelectedExtras({});
    setQuantity(1);
  }, [productId]);

  const extras = product ? optionsForProduct(product) : [];
  const selectedExtraOptions = extras.filter((extra) => selectedExtras[extra.id]);

  const pattyUpcharge = product?.category === "burger" ? (pattyCount - 1) * 2 : 0;
  const extrasTotal = selectedExtraOptions.reduce(
    (sum, extra) => sum + extra.priceUsd,
    0
  );
  const unitPrice = (product?.priceUsd ?? 0) + pattyUpcharge + extrasTotal;
  const lineTotal = unitPrice * quantity;

  const summary = useMemo(() => {
    if (!product) {
      return [];
    }
    const parts: string[] = [];
    if (product.category === "burger") {
      parts.push(
        `${pattyCount} ${
          pattyCount === 1
            ? t("customizerPattySingular")
            : t("customizerPattyPlural")
        }`
      );
    }
    for (const extra of selectedExtraOptions) {
      parts.push(t(extra.labelKey));
    }
    return parts;
  }, [pattyCount, product, selectedExtraOptions]);

  const toggleExtra = (id: string) => {
    setSelectedExtras((current) => ({ ...current, [id]: !current[id] }));
  };

  const handleAdd = () => {
    if (!product) {
      return;
    }
    addCustomizedProduct({
      productId: product.id,
      quantity,
      unitPriceUsd: unitPrice,
      customizationSummary: summary,
    });
    showToast(product.name);
    closeCustomizer();
  };

  return (
    <Dialog
      open={Boolean(product)}
      onClose={closeCustomizer}
      fullWidth
      maxWidth="sm"
      data-testid="item-customizer"
      slotProps={{
        paper: {
          sx: {
            backgroundImage:
              "linear-gradient(180deg, #241711 0%, #130c08 100%)",
            border: "1px solid rgba(246, 196, 83, 0.18)",
          },
        },
      }}
    >
      <DialogTitle sx={{ pr: 7 }}>
        <Typography variant="h6" component="span" sx={{ fontWeight: 700 }}>
          {t("customizerTitle", { item: product?.shortName ?? "" })}
        </Typography>
        <IconButton
          aria-label={t("customizerClose")}
          onClick={closeCustomizer}
          sx={{ position: "absolute", right: 12, top: 12, color: "common.white" }}
        >
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {product && (
          <Stack spacing={2.5}>
            <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
              <Box
                component="img"
                src={product.imageSrc}
                alt=""
                sx={{
                  width: 96,
                  height: 72,
                  objectFit: "cover",
                  borderRadius: 2,
                  border: "1px solid rgba(246, 196, 83, 0.16)",
                }}
              />
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  {product.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t("customizerBasePrice", {
                    price: formatPrice(product.priceUsd),
                  })}
                </Typography>
              </Box>
            </Stack>

            {product.category === "burger" && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                  {t("customizerPatties")}
                </Typography>
                <RadioGroup
                  value={String(pattyCount)}
                  onChange={(e) => setPattyCount(Number(e.target.value))}
                >
                  {[1, 2, 3].map((count) => (
                    <FormControlLabel
                      key={count}
                      value={String(count)}
                      control={<Radio />}
                      label={`${count} ${
                        count === 1
                          ? t("customizerPattySingular")
                          : t("customizerPattyPlural")
                      }${count > 1 ? ` (+${formatPrice((count - 1) * 2)})` : ""}`}
                    />
                  ))}
                </RadioGroup>
              </Box>
            )}

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                {t("customizerAddOns")}
              </Typography>
              <Stack spacing={0.25}>
                {extras.map((extra) => (
                  <FormControlLabel
                    key={extra.id}
                    control={
                      <Checkbox
                        checked={Boolean(selectedExtras[extra.id])}
                        onChange={() => toggleExtra(extra.id)}
                      />
                    }
                    label={`${t(extra.labelKey)}${
                      extra.priceUsd > 0 ? ` (+${formatPrice(extra.priceUsd)})` : ""
                    }`}
                  />
                ))}
              </Stack>
            </Box>

            <Stack
              direction="row"
              sx={{ alignItems: "center", justifyContent: "space-between" }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {t("customizerQuantity")}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <IconButton
                  size="small"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label={t("customizerDecreaseQuantity")}
                  sx={{ border: "1px solid", borderColor: "divider" }}
                >
                  <RemoveRoundedIcon fontSize="small" />
                </IconButton>
                <Typography
                  variant="subtitle2"
                  sx={{ minWidth: 24, textAlign: "center", fontWeight: 700 }}
                >
                  {quantity}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label={t("customizerIncreaseQuantity")}
                  sx={{ border: "1px solid", borderColor: "divider" }}
                >
                  <AddRoundedIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Stack>
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, justifyContent: "space-between" }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
          {formatPrice(lineTotal)}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddShoppingCartRoundedIcon />}
          onClick={handleAdd}
          data-testid="customizer-add-to-cart"
        >
          {t("customizerAddToCart")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

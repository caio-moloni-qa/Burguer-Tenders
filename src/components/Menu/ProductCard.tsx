import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import AddShoppingCartRoundedIcon from "@mui/icons-material/AddShoppingCartRounded";
import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded";
import { useCartStore } from "../../stores/cartStore";
import {
  selectHasDeliveryLocation,
  useLocationStore,
} from "../../stores/locationStore";
import { useUiStore } from "../../stores/uiStore";
import {
  formatPrice,
  localizedProductDescription,
  productName,
  t,
} from "../../i18n/locale";
import type { Product } from "../../types/product";

type Props = {
  product: Product;
};

const CALORIE_METER_MAX = 1200;

export function ProductCard({ product }: Props) {
  const located = useLocationStore(selectHasDeliveryLocation);
  const closeCart = useCartStore((s) => s.closeDrawer);
  const isCartOpen = useCartStore((s) => s.drawerOpen);
  const openPanel = useLocationStore((s) => s.openPanel);
  const setPendingAddProductId = useUiStore((s) => s.setPendingAddProductId);
  const openCustomizer = useUiStore((s) => s.openCustomizer);
  const name = productName(product);
  const caloriesPercent = Math.min(
    100,
    Math.round((product.caloriesKcal / CALORIE_METER_MAX) * 100)
  );

  const handleAddToCart = () => {
    if (!located) {
      setPendingAddProductId(product.id);
      if (isCartOpen) {
        closeCart();
      }
      openPanel();
      return;
    }
    openCustomizer(product.id);
  };

  return (
    <Card
      className="product-card"
      data-product-id={product.id}
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        transition: "transform 160ms ease, box-shadow 160ms ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: 6,
        },
      }}
    >
      <Box
        sx={{
          position: "relative",
          aspectRatio: "4 / 3",
          bgcolor: "rgba(10, 6, 4, 0.9)",
        }}
      >
        <CardMedia
          component="img"
          src={product.imageSrc}
          alt={name}
          loading="lazy"
          data-testid="product-image"
          sx={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        {product.spicy && (
          <Chip
            className="product-card__badge"
            icon={<LocalFireDepartmentRoundedIcon />}
            label={t("spicyBadge")}
            color="primary"
            size="small"
            sx={{
              position: "absolute",
              top: 12,
              left: 12,
              fontWeight: 700,
              boxShadow: 2,
            }}
          />
        )}
      </Box>
      <CardContent sx={{ flexGrow: 1, pb: 1.5 }}>
        <Stack spacing={1}>
          <Typography
            className="product-card__name"
            variant="h6"
            component="h2"
            sx={{ lineHeight: 1.25 }}
          >
            {name}
          </Typography>
          <Typography className="product-card__desc" variant="body2" color="text.secondary">
            {localizedProductDescription(product)}
          </Typography>
          <Box className="product-card__calories" sx={{ pt: 0.25 }}>
            <Stack
              direction="row"
              sx={{
                alignItems: "center",
                justifyContent: "space-between",
                mb: 0.5,
              }}
            >
              <Typography variant="caption" color="text.secondary">
                {t("caloriesLabel")}
              </Typography>
              <Typography
                variant="caption"
                sx={{ fontWeight: 700, color: "secondary.main" }}
              >
                {t("caloriesValue", {
                  calories: String(product.caloriesKcal),
                })}
              </Typography>
            </Stack>
            <Box
              role="meter"
              aria-label={`${name} ${t("caloriesLabel")}`}
              aria-valuemin={0}
              aria-valuemax={CALORIE_METER_MAX}
              aria-valuenow={product.caloriesKcal}
              sx={{
                height: 8,
                overflow: "hidden",
                borderRadius: 999,
                bgcolor: "rgba(246, 196, 83, 0.16)",
              }}
            >
              <Box
                sx={{
                  width: `${caloriesPercent}%`,
                  height: "100%",
                  borderRadius: "inherit",
                  background:
                    "linear-gradient(90deg, #5fbf7a 0%, #f6c453 58%, #c77738 100%)",
                }}
              />
            </Box>
          </Box>
          <Typography
            className="product-card__price"
            variant="h6"
            color="primary.dark"
            sx={{ fontWeight: 700 }}
            data-price-usd={product.priceUsd}
          >
            {formatPrice(product.priceUsd)}
          </Typography>
        </Stack>
      </CardContent>
      <CardActions sx={{ px: 2, pb: 2 }}>
        <Tooltip title={located ? "" : t("menuAddToCartHint")} placement="top">
          <Button
            variant="contained"
            color="primary"
            fullWidth
            startIcon={<AddShoppingCartRoundedIcon />}
            onClick={handleAddToCart}
            data-action="add-to-cart"
            data-product-id={product.id}
            data-testid="add-to-cart"
          >
            {t("menuAddToCart")}
          </Button>
        </Tooltip>
      </CardActions>
    </Card>
  );
}

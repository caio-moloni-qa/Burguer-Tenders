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
import { formatPrice, t } from "../../i18n/locale";
import type { Product } from "../../types/product";

type Props = {
  product: Product;
};

export function ProductCard({ product }: Props) {
  const located = useLocationStore(selectHasDeliveryLocation);
  const closeCart = useCartStore((s) => s.closeDrawer);
  const isCartOpen = useCartStore((s) => s.drawerOpen);
  const openPanel = useLocationStore((s) => s.openPanel);
  const setPendingAddProductId = useUiStore((s) => s.setPendingAddProductId);
  const openCustomizer = useUiStore((s) => s.openCustomizer);

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
          alt={product.name}
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
            {product.name}
          </Typography>
          <Typography className="product-card__desc" variant="body2" color="text.secondary">
            {product.description}
          </Typography>
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

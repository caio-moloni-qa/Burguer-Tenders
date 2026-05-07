import { useMemo } from "react";
import { Box, Container, Stack, Typography } from "@mui/material";
import { products } from "../../data/products";
import { useUiStore } from "../../stores/uiStore";
import { Header } from "../Header/Header";
import { CategoryFilter } from "./CategoryFilter";
import { MenuSearch } from "./MenuSearch";
import { ProductCard } from "./ProductCard";
import { PromoBanner } from "./PromoBanner";
import { StoreBanner } from "./StoreBanner";
import { t } from "../../i18n/locale";

export function MenuPage() {
  const activeFilter = useUiStore((s) => s.menuFilter);
  const search = useUiStore((s) => s.menuSearch);

  const filtered = useMemo(() => {
    const byCategory =
      activeFilter === "all"
        ? products
        : products.filter((p) => p.category === activeFilter);
    if (!search) {
      return byCategory;
    }
    return byCategory.filter(
      (p) =>
        p.name.toLowerCase().includes(search) ||
        p.description.toLowerCase().includes(search)
    );
  }, [activeFilter, search]);

  return (
    <>
      <Header />
      <PromoBanner />
      <Container component="main" maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}>
        <StoreBanner />
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{
            alignItems: { xs: "stretch", sm: "center" },
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Typography variant="h5" component="h2">
            {t("menuHeading")}
          </Typography>
          <CategoryFilter />
        </Stack>
        <MenuSearch />
        <Box
          data-testid="product-grid"
          sx={{
            display: "grid",
            gap: { xs: 2, md: 3 },
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
            },
          }}
        >
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </Box>
        {filtered.length === 0 && (
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mt: 4, textAlign: "center" }}
          >
            {t("menuNoItems")}
          </Typography>
        )}
      </Container>
    </>
  );
}

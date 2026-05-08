import { useMemo } from "react";
import { Box, Container, Typography } from "@mui/material";
import { products } from "../../data/products";
import { useUiStore } from "../../stores/uiStore";
import { Header } from "../Header/Header";
import { CategoryFilter } from "./CategoryFilter";
import { MenuSearch } from "./MenuSearch";
import { ProductCard } from "./ProductCard";
import { PromoBanner } from "./PromoBanner";
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
      <Container
        component="main"
        maxWidth={false}
        sx={{
          py: { xs: 3, md: 4 },
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <CategoryFilter />
        </Box>
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
              lg: "repeat(4, 1fr)",
              xl: "repeat(5, 1fr)",
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

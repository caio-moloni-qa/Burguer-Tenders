import type { Locale } from "../i18n/locale";

export type ProductCategory = "burger" | "tenders" | "combo" | "drink" | "side";

export type ProductTranslation = {
  name: string;
  shortName: string;
  description: string;
};

export type Product = {
  id: string;
  name: string;
  shortName: string;
  description: string;
  /** Public URL path (Vite `public/`), e.g. `/images/products/cheeseburguer.png`. */
  imageSrc: string;
  /** Price in USD for display (training app — not a billing engine). */
  priceUsd: number;
  /** Estimated calories for the default product, before customizations. */
  caloriesKcal: number;
  category: ProductCategory;
  spicy: boolean;
  translations?: Partial<Record<Locale, ProductTranslation>>;
};

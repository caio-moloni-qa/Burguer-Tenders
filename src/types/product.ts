export type ProductCategory = "burger" | "tenders" | "combo" | "drink" | "side";

export type Product = {
  id: string;
  name: string;
  shortName: string;
  description: string;
  /** Public URL path (Vite `public/`), e.g. `/images/products/cheeseburguer.png`. */
  imageSrc: string;
  /** Price in USD for display (training app — not a billing engine). */
  priceUsd: number;
  category: ProductCategory;
  spicy: boolean;
};

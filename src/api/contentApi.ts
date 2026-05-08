import { setProducts } from "../data/products";
import { setPromos, type PromoContent } from "../data/promos";
import {
  setTranslationDictionaries,
  type Locale,
  type TranslationKey,
} from "../i18n/locale";
import type { Product } from "../types/product";

type ContentPayload = {
  translations: Partial<Record<Locale, Partial<Record<TranslationKey, string>>>>;
  products: Product[];
  promos: PromoContent[];
};

export async function hydrateContentFromDatabase(): Promise<void> {
  const response = await fetch("/api/content", { credentials: "include" });
  if (!response.ok) {
    throw new Error(`Could not load content database (${response.status})`);
  }

  const payload = (await response.json()) as ContentPayload;
  setTranslationDictionaries(payload.translations);
  setProducts(payload.products);
  setPromos(payload.promos);
}

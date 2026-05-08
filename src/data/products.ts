import type { Product } from "../types/product";

export let products: readonly Product[] = [];

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function setProducts(nextProducts: readonly Product[]): void {
  products = nextProducts;
}

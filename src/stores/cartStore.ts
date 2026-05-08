import { create } from "zustand";
import { getProductById } from "../data/products";

export type CartLine = {
  id: string;
  productId: string;
  quantity: number;
  unitPriceUsd: number;
  customizationSummary: string[];
};

type CartState = {
  /** Cart lines keyed by line id. Customized items use unique line ids. */
  linesById: Record<string, CartLine>;
  drawerOpen: boolean;

  addProduct: (productId: string, amount?: number) => void;
  addCustomizedProduct: (line: Omit<CartLine, "id">) => void;
  setQuantity: (lineId: string, quantity: number) => void;
  removeLine: (lineId: string) => void;
  clear: () => void;

  toggleDrawer: () => void;
  closeDrawer: () => void;
};

export const useCartStore = create<CartState>((set) => ({
  linesById: {},
  drawerOpen: false,

  addProduct: (productId, amount = 1) =>
    set((state) => {
      if (amount <= 0) {
        return state;
      }
      const product = getProductById(productId);
      if (!product) {
        return state;
      }
      const existing = state.linesById[productId];
      const nextLine: CartLine = existing
        ? { ...existing, quantity: existing.quantity + amount }
        : {
            id: productId,
            productId,
            quantity: amount,
            unitPriceUsd: product.priceUsd,
            customizationSummary: [],
          };
      return { linesById: { ...state.linesById, [productId]: nextLine } };
    }),

  addCustomizedProduct: (line) =>
    set((state) => {
      const lineId = `${line.productId}-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`;
      return {
        linesById: {
          ...state.linesById,
          [lineId]: { ...line, id: lineId },
        },
      };
    }),

  setQuantity: (lineId, quantity) =>
    set((state) => {
      const next = { ...state.linesById };
      if (quantity <= 0) {
        delete next[lineId];
      } else if (next[lineId]) {
        next[lineId] = { ...next[lineId], quantity };
      } else {
        const product = getProductById(lineId);
        if (product) {
          next[lineId] = {
            id: lineId,
            productId: lineId,
            quantity,
            unitPriceUsd: product.priceUsd,
            customizationSummary: [],
          };
        }
      }
      return { linesById: next };
    }),

  removeLine: (lineId) =>
    set((state) => {
      const next = { ...state.linesById };
      delete next[lineId];
      return { linesById: next };
    }),

  clear: () => set({ linesById: {} }),

  toggleDrawer: () => set((s) => ({ drawerOpen: !s.drawerOpen })),
  closeDrawer: () => set({ drawerOpen: false }),
}));

// Derived helpers
//
// IMPORTANT: do NOT pass these directly to `useCartStore(...)` when they return
// arrays or objects. Subscribe to the raw `linesById` map and useMemo this work.

export function getCartLines(linesById: Record<string, CartLine>): CartLine[] {
  return Object.values(linesById).filter((line) => line.quantity > 0);
}

export function selectTotalItemCount(state: {
  linesById: Record<string, CartLine>;
}): number {
  let n = 0;
  for (const line of Object.values(state.linesById)) {
    n += line.quantity;
  }
  return n;
}

export function selectSubtotal(state: {
  linesById: Record<string, CartLine>;
}): number {
  let total = 0;
  for (const line of Object.values(state.linesById)) {
    if (line.quantity > 0) {
      total += line.unitPriceUsd * line.quantity;
    }
  }
  return total;
}

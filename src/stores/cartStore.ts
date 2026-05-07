import { create } from "zustand";
import { getProductById } from "../data/products";

export type CartLine = {
  productId: string;
  quantity: number;
};

type CartState = {
  /** Productid → quantity. Lines with quantity ≤ 0 are removed. */
  quantities: Record<string, number>;
  drawerOpen: boolean;

  addProduct: (productId: string, amount?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeLine: (productId: string) => void;
  clear: () => void;

  toggleDrawer: () => void;
  closeDrawer: () => void;
};

export const useCartStore = create<CartState>((set) => ({
  quantities: {},
  drawerOpen: false,

  addProduct: (productId, amount = 1) =>
    set((state) => {
      if (amount <= 0) {
        return state;
      }
      const next = (state.quantities[productId] ?? 0) + amount;
      return { quantities: { ...state.quantities, [productId]: next } };
    }),

  setQuantity: (productId, quantity) =>
    set((state) => {
      const next = { ...state.quantities };
      if (quantity <= 0) {
        delete next[productId];
      } else {
        next[productId] = quantity;
      }
      return { quantities: next };
    }),

  removeLine: (productId) =>
    set((state) => {
      const next = { ...state.quantities };
      delete next[productId];
      return { quantities: next };
    }),

  clear: () => set({ quantities: {} }),

  toggleDrawer: () => set((s) => ({ drawerOpen: !s.drawerOpen })),
  closeDrawer: () => set({ drawerOpen: false }),
}));

// ─── Derived helpers ──────────────────────────────────────────────────────────
//
// IMPORTANT: do NOT pass these directly to `useCartStore(...)` when they return
// arrays or objects — `useSyncExternalStore` requires the snapshot to be cached
// across calls, and a fresh array literal triggers an infinite render loop.
// Instead, subscribe to the raw `quantities` map (its reference is stable
// between mutations) and feed it to these helpers from a `useMemo`.

export function getCartLines(
  quantities: Record<string, number>
): CartLine[] {
  return Object.entries(quantities)
    .filter(([, q]) => q > 0)
    .map(([productId, quantity]) => ({ productId, quantity }));
}

/** Primitive return — safe to use as a selector: `useCartStore(selectTotalItemCount)`. */
export function selectTotalItemCount(state: {
  quantities: Record<string, number>;
}): number {
  let n = 0;
  for (const q of Object.values(state.quantities)) {
    n += q;
  }
  return n;
}

/** Primitive return — safe to use as a selector. */
export function selectSubtotal(state: { quantities: Record<string, number> }): number {
  let total = 0;
  for (const [productId, quantity] of Object.entries(state.quantities)) {
    if (quantity <= 0) {
      continue;
    }
    const p = getProductById(productId);
    if (p) {
      total += p.priceUsd * quantity;
    }
  }
  return total;
}

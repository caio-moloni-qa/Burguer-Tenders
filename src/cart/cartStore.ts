export type CartLine = {
  productId: string;
  quantity: number;
};

export function createCartStore() {
  const quantities = new Map<string, number>();
  let drawerOpen = false;
  const listeners = new Set<() => void>();

  function emit(): void {
    listeners.forEach((fn) => fn());
  }

  return {
    subscribe(fn: () => void): () => void {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    getLines(): CartLine[] {
      return [...quantities.entries()]
        .filter(([, q]) => q > 0)
        .map(([productId, quantity]) => ({ productId, quantity }));
    },
    getQuantity(productId: string): number {
      return quantities.get(productId) ?? 0;
    },
    getTotalItemCount(): number {
      let n = 0;
      for (const q of quantities.values()) {
        n += q;
      }
      return n;
    },
    addProduct(productId: string, amount = 1): void {
      if (amount <= 0) {
        return;
      }
      const next = (quantities.get(productId) ?? 0) + amount;
      quantities.set(productId, next);
      emit();
    },
    /** Mutate quantity without triggering a full re-render. Use with patchCartDOM(). */
    addProductSilent(productId: string, amount = 1): void {
      if (amount <= 0) {
        return;
      }
      const next = (quantities.get(productId) ?? 0) + amount;
      quantities.set(productId, next);
    },
    setQuantity(productId: string, quantity: number): void {
      if (quantity <= 0) {
        quantities.delete(productId);
      } else {
        quantities.set(productId, quantity);
      }
      emit();
    },
    /** Mutate quantity without triggering a full re-render. Use with patchCartDOM(). */
    setQuantitySilent(productId: string, quantity: number): void {
      if (quantity <= 0) {
        quantities.delete(productId);
      } else {
        quantities.set(productId, quantity);
      }
    },
    removeLine(productId: string): void {
      quantities.delete(productId);
      emit();
    },
    /** Remove a line without triggering a full re-render. Use with patchCartDOM(). */
    removeLineSilent(productId: string): void {
      quantities.delete(productId);
    },
    clear(): void {
      quantities.clear();
      emit();
    },
    isDrawerOpen(): boolean {
      return drawerOpen;
    },
    toggleDrawer(): void {
      drawerOpen = !drawerOpen;
      emit();
    },
    closeDrawer(): void {
      drawerOpen = false;
      emit();
    },
  };
}

export type CartStore = ReturnType<typeof createCartStore>;

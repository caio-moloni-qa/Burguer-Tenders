import { create } from "zustand";
import type { AuthUser, PreviousOrder } from "../types/auth";

type AuthState = {
  user: AuthUser | null;
  orders: PreviousOrder[];
  reorderPromptDismissed: boolean;

  setUser: (user: AuthUser | null) => void;
  setOrders: (orders: PreviousOrder[]) => void;
  addOrder: (order: PreviousOrder) => void;
  dismissReorderPrompt: () => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  orders: [],
  reorderPromptDismissed: false,

  setUser: (user) => set({ user, reorderPromptDismissed: false }),
  setOrders: (orders) => set({ orders }),
  addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
  dismissReorderPrompt: () => set({ reorderPromptDismissed: true }),
  clearAuth: () => set({ user: null, orders: [], reorderPromptDismissed: false }),
}));

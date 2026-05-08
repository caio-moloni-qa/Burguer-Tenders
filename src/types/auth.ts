import type { CartLine } from "../stores/cartStore";
import type { LocationDelivery } from "../stores/locationStore";

export type AuthUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  location: LocationDelivery | null;
};

export type PreviousOrder = {
  id: string;
  orderedAt: string;
  totalUsd: number;
  delivery: LocationDelivery;
  lines: Array<Omit<CartLine, "id">>;
};

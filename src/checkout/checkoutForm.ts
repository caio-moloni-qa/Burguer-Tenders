export type PaymentMethod = "card" | "pay-in-restaurant";

/** Persisted while the SPA runs so navigation does not wipe fields mid-typing sync. */
export const checkoutForm = {
  fullName: "",
  email: "",
  zipCode: "",
  paymentMethod: "card" as PaymentMethod,
  /** Shown when paying by card */
  cardNameOnCard: "",
  cardNumber: "",
  cardExpiry: "",
  cardCvc: "",
};

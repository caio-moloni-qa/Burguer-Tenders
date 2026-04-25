export type PaymentMethod = "card" | "pay-in-restaurant";
export type TipPercent = 0 | 10 | 15 | 20;
export type DonationType = "none" | "fixed" | "percent";

export const DONATION_ASSOCIATION = "Associação de doações Teste";
export const DONATION_FIXED_OPTIONS = [1, 2, 5] as const;
export const DONATION_PERCENT_OPTIONS = [1, 2, 5] as const;

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
  tipPercent: 0 as TipPercent,
  donationType: "none" as DonationType,
  /** Fixed amount in USD or percentage value depending on donationType */
  donationAmount: 0,
  /** Raw text of the custom fixed-amount input (empty when a preset is active) */
  donationCustomFixed: "",
  /** Raw text of the custom percent input (empty when a preset is active) */
  donationCustomPercent: "",
};

import { create } from "zustand";

export type PaymentMethod = "card" | "pay-in-restaurant";
export type TipPercent = 0 | 10 | 15 | 20;
export type DonationType = "none" | "fixed" | "percent";

export const DONATION_FIXED_OPTIONS = [1, 2, 5] as const;
export const DONATION_PERCENT_OPTIONS = [1, 2, 5] as const;

export type CheckoutForm = {
  fullName: string;
  email: string;
  zipCode: string;
  paymentMethod: PaymentMethod;
  cardNameOnCard: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvc: string;
  tipPercent: TipPercent;
  donationType: DonationType;
  /** USD amount when fixed; percentage value when percent; 0 otherwise. */
  donationAmount: number;
  donationCustomFixed: string;
  donationCustomPercent: string;
};

const emptyForm = (): CheckoutForm => ({
  fullName: "",
  email: "",
  zipCode: "",
  paymentMethod: "card",
  cardNameOnCard: "",
  cardNumber: "",
  cardExpiry: "",
  cardCvc: "",
  tipPercent: 0,
  donationType: "none",
  donationAmount: 0,
  donationCustomFixed: "",
  donationCustomPercent: "",
});

type CheckoutState = {
  form: CheckoutForm;
  errors: Record<string, string>;
  /** Filled in after submit so the confirmation page can greet the user. */
  confirmedUserName: string;

  setField: <K extends keyof CheckoutForm>(field: K, value: CheckoutForm[K]) => void;
  resetForm: () => void;
  setErrors: (errors: Record<string, string>) => void;
  clearError: (field: string) => void;
  clearAllErrors: () => void;
  setConfirmedUserName: (name: string) => void;
};

export const useCheckoutStore = create<CheckoutState>((set) => ({
  form: emptyForm(),
  errors: {},
  confirmedUserName: "",

  setField: (field, value) =>
    set((state) => ({
      form: { ...state.form, [field]: value },
      // Clearing the error on edit gives instant feedback as the user fixes a field.
      errors: state.errors[field] ? omitKey(state.errors, field) : state.errors,
    })),

  resetForm: () => set({ form: emptyForm(), errors: {} }),

  setErrors: (errors) => set({ errors }),
  clearError: (field) =>
    set((state) =>
      state.errors[field] ? { errors: omitKey(state.errors, field) } : state
    ),
  clearAllErrors: () => set({ errors: {} }),
  setConfirmedUserName: (name) => set({ confirmedUserName: name }),
}));

function omitKey<T extends Record<string, unknown>>(obj: T, key: string): T {
  const next = { ...obj };
  delete next[key];
  return next;
}


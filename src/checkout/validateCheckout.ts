import { checkoutForm } from "./checkoutForm";
import { locationDelivery } from "../location/location";

type CheckoutFormState = typeof checkoutForm;

export type CheckoutValidationResult = {
  valid: boolean;
  errors: Record<string, string>;
  firstFocusField?: string;
};

function isValidEmail(s: string): boolean {
  const at = s.trim().indexOf("@");
  if (!at) {
    return false;
  }
  const domain = s.trim().slice(at + 1);
  return domain.length > 0 && domain.includes(".");
}

/** Only letters (including accented), spaces, hyphens, and apostrophes. */
function isValidCardName(s: string): boolean {
  return /^[A-Za-zÀ-ÖØ-öø-ÿ\s'\-]+$/.test(s.trim());
}

/** 13–19 digits (spaces stripped). */
function isValidCardNumber(s: string): boolean {
  const digits = s.replace(/\s/g, "");
  return /^\d{13,19}$/.test(digits);
}

/**
 * Expects "MM / YY". Month 01-12, not expired relative to the current month.
 */
function isValidExpiry(s: string): boolean {
  const digits = s.replace(/\D/g, "");
  if (digits.length !== 4) {
    return false;
  }
  const month = parseInt(digits.slice(0, 2), 10);
  const year = parseInt(digits.slice(2, 4), 10) + 2000;
  if (month < 1 || month > 12) {
    return false;
  }
  // Card is valid through the last day of the expiry month.
  const now = new Date();
  const expiry = new Date(year, month); // 1st of the month AFTER expiry
  return expiry > now;
}

/** 3 or 4 digits, nothing else. */
function isValidCvc(s: string): boolean {
  return /^\d{3,4}$/.test(s.trim());
}

/**
 * Validates mandatory checkout fields. Card fields required only when paying by card.
 */
export function validateCheckout(f: CheckoutFormState): CheckoutValidationResult {
  const errors: Record<string, string> = {};

  if (!f.fullName.trim()) {
    errors.fullName = "Name is required.";
  }
  if (!f.email.trim()) {
    errors.email = "Email is required.";
  } else if (!isValidEmail(f.email)) {
    errors.email = "Enter a valid email address.";
  }

  const zip = f.zipCode.trim() || locationDelivery.zipCode.trim();
  if (!zip) {
    errors.zipCode = "ZIP / postal code is required.";
  }

  if (f.paymentMethod === "card") {
    if (!f.cardNameOnCard.trim()) {
      errors.cardNameOnCard = "Name on card is required.";
    } else if (!isValidCardName(f.cardNameOnCard)) {
      errors.cardNameOnCard = "Name on card must contain only letters and spaces.";
    }

    const rawNumber = f.cardNumber.replace(/\s/g, "");
    if (!rawNumber) {
      errors.cardNumber = "Card number is required.";
    } else if (!isValidCardNumber(f.cardNumber)) {
      errors.cardNumber = "Enter a valid card number (13–19 digits).";
    }

    if (!f.cardExpiry.trim()) {
      errors.cardExpiry = "Expiry date is required.";
    } else if (!isValidExpiry(f.cardExpiry)) {
      errors.cardExpiry = "Enter a valid expiry date (MM / YY) that hasn't passed.";
    }

    if (!f.cardCvc.trim()) {
      errors.cardCvc = "Security code is required.";
    } else if (!isValidCvc(f.cardCvc)) {
      errors.cardCvc = "Security code must be 3 or 4 digits.";
    }
  }

  const fieldOrder = [
    "fullName",
    "email",
    "zipCode",
    "cardNameOnCard",
    "cardNumber",
    "cardExpiry",
    "cardCvc",
  ];
  const firstFocusField = fieldOrder.find((key) => errors[key] != null);

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    firstFocusField,
  };
}

export const checkoutFieldFocusId: Record<string, string> = {
  fullName: "checkout-name",
  email: "checkout-email",
  zipCode: "checkout-zip",
  cardNameOnCard: "checkout-card-name",
  cardNumber: "checkout-card-number",
  cardExpiry: "checkout-card-expiry",
  cardCvc: "checkout-card-cvc",
};

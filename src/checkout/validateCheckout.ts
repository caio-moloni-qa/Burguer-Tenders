import type { CheckoutForm } from "../stores/checkoutStore";
import { t } from "../i18n/locale";
import { digitsOnly, isLetter } from "../utils/text";

export type CheckoutValidationResult = {
  valid: boolean;
  errors: Record<string, string>;
  firstFocusField?: string;
};

function isValidEmail(s: string): boolean {
  const at = s.trim().indexOf("@");
  if (at <= 0) {
    return false;
  }
  const domain = s.trim().slice(at + 1);
  return domain.length > 0 && domain.includes(".");
}

/** Only letters (including accented), spaces, hyphens, and apostrophes. */
function isValidCardName(s: string): boolean {
  const trimmed = s.trim();
  if (!trimmed) {
    return false;
  }
  for (const char of trimmed) {
    if (!isLetter(char) && char !== " " && char !== "-" && char !== "'") {
      return false;
    }
  }
  return true;
}

/** 13–19 digits (spaces stripped). */
function isValidCardNumber(s: string): boolean {
  const digits = digitsOnly(s);
  return digits.length >= 13 && digits.length <= 19;
}

/** Expects "MM / YY". Month 01-12, not expired relative to the current month. */
function isValidExpiry(s: string): boolean {
  const digits = digitsOnly(s);
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
  const expiry = new Date(year, month);
  return expiry > now;
}

function isValidCvc(s: string): boolean {
  const digits = digitsOnly(s);
  return digits.length >= 3 && digits.length <= 4 && digits.length === s.trim().length;
}

/**
 * Validates mandatory checkout fields. Card fields required only when paying by card.
 * `fallbackZip` lets the caller pass the saved-delivery ZIP so the checkout form
 * doesn't fail validation when the zip input is empty but a delivery is set.
 */
export function validateCheckout(
  f: CheckoutForm,
  fallbackZip = ""
): CheckoutValidationResult {
  const errors: Record<string, string> = {};

  if (!f.fullName.trim()) {
    errors.fullName = t("checkoutErrorNameRequired");
  }
  if (!f.email.trim()) {
    errors.email = t("checkoutErrorEmailRequired");
  } else if (!isValidEmail(f.email)) {
    errors.email = t("checkoutErrorEmailInvalid");
  }

  const zip = f.zipCode.trim() || fallbackZip.trim();
  if (!zip) {
    errors.zipCode = t("checkoutErrorZipRequired");
  }

  if (f.paymentMethod === "card") {
    if (!f.cardNameOnCard.trim()) {
      errors.cardNameOnCard = t("checkoutErrorCardNameRequired");
    } else if (!isValidCardName(f.cardNameOnCard)) {
      errors.cardNameOnCard = t("checkoutErrorCardNameInvalid");
    }

    const rawNumber = digitsOnly(f.cardNumber);
    if (!rawNumber) {
      errors.cardNumber = t("checkoutErrorCardNumberRequired");
    } else if (!isValidCardNumber(f.cardNumber)) {
      errors.cardNumber = t("checkoutErrorCardNumberInvalid");
    }

    if (!f.cardExpiry.trim()) {
      errors.cardExpiry = t("checkoutErrorExpiryRequired");
    } else if (!isValidExpiry(f.cardExpiry)) {
      errors.cardExpiry = t("checkoutErrorExpiryInvalid");
    }

    if (!f.cardCvc.trim()) {
      errors.cardCvc = t("checkoutErrorCvcRequired");
    } else if (!isValidCvc(f.cardCvc)) {
      errors.cardCvc = t("checkoutErrorCvcInvalid");
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

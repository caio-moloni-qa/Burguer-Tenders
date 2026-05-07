/**
 * Real-time input formatters for the checkout card fields.
 * Each returns the value the input should display after the user types.
 */

/** Strip digits and any character that isn't a letter, space, hyphen, or apostrophe. */
export function formatCardName(raw: string): string {
  return raw.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s'\-]/g, "");
}

/** Keep up to 16 digits and group them into blocks of 4 separated by spaces. */
export function formatCardNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 16);
  return digits.match(/.{1,4}/g)?.join(" ") ?? digits;
}

/** Keep up to 4 digits and display them as "MM / YY". */
export function formatCardExpiry(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)} / ${digits.slice(2)}` : digits;
}

/** Digits only, max 4. */
export function formatCardCvc(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, 4);
}

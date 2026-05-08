import { digitsOnly, isLetter } from "../utils/text";

/**
 * Real-time input formatters for the checkout card fields.
 * Each returns the value the input should display after the user types.
 */

/** Strip digits and any character that isn't a letter, space, hyphen, or apostrophe. */
export function formatCardName(raw: string): string {
  let out = "";
  for (const char of raw) {
    if (isLetter(char) || char === " " || char === "-" || char === "'") {
      out += char;
    }
  }
  return out;
}

/** Keep up to 16 digits and group them into blocks of 4 separated by spaces. */
export function formatCardNumber(raw: string): string {
  const digits = digitsOnly(raw, 16);
  const groups: string[] = [];
  for (let i = 0; i < digits.length; i += 4) {
    groups.push(digits.slice(i, i + 4));
  }
  return groups.join(" ");
}

/** Keep up to 4 digits and display them as "MM / YY". */
export function formatCardExpiry(raw: string): string {
  const digits = digitsOnly(raw, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)} / ${digits.slice(2)}` : digits;
}

/** Digits only, max 4. */
export function formatCardCvc(raw: string): string {
  return digitsOnly(raw, 4);
}

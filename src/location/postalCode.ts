import { digitsOnly } from "../utils/text";

/**
 * Returns true when the entered ZIP/postal code is in a complete-enough form
 * to be auto-looked-up on input blur.
 *  - Brazil: 8 digits
 *  - Other (e.g. US): 5 digits
 */
export function shouldAutoLookupPostal(zip: string, countryCode: string): boolean {
  const digits = digitsOnly(zip);
  if (countryCode === "BR") {
    return digits.length === 8;
  }
  return digits.length === 5;
}

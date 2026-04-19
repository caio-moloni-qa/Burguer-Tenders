/** Inline validation messages for checkout (cleared as the user edits). */
export const checkoutValidationErrors: Record<string, string> = {};

export function clearCheckoutValidationErrors(): void {
  for (const k of Object.keys(checkoutValidationErrors)) {
    delete checkoutValidationErrors[k];
  }
}

export function clearCheckoutValidationError(field: string): void {
  delete checkoutValidationErrors[field];
}

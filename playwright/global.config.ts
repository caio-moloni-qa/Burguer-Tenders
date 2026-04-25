/**
 * Global constants shared across playwright.config.ts and test files.
 * Import from here instead of hardcoding values in individual specs.
 */

export const BASE_URL = "http://localhost:5173";

export const TIMEOUTS = {
  /** Default action timeout (click, fill, etc.) */
  action: 10_000,
  /** Navigation / page load */
  navigation: 30_000,
  /** Geocoding API — can be slow on first cold request */
  geocoding: 20_000,
  /** Spinner to appear after triggering a lookup */
  spinnerAppear: 5_000,
  /** Time the Save button stays disabled after a lookup resolves */
  saveReEnable: 3_000,
  /** Checkout page-spinner overlay */
  checkoutSpinner: 4_000,
  /** Cart toast auto-hide window */
  toast: 3_500,
} as const;

export const VIEWPORT = { width: 1280, height: 800 } as const;

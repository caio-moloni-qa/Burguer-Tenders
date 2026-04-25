/**
 * Static test data — ZIPs, card details, product IDs.
 * Import from here in specs and page objects instead of duplicating constants.
 */

export const ZIPS = {
  londrina: { zip: "86015280", country: "BR", store: "Burguer-Tenders Higienopolis" },
  saoPaulo: { zip: "05413010", country: "BR", store: "Burguer-Tenders Pinheiros"   },
  newYork:  { zip: "10001",    country: "US", store: "Burguer-Tenders Midtown"      },
  curitiba: { zip: "80010010", country: "BR", store: null                           },
} as const;

export type ZipKey = keyof typeof ZIPS;
export type Country = "BR" | "US";

export const CARD = {
  name:   "Test User",
  number: "4111111111111111",
  expiry: "1228",
  cvc:    "123",
} as const;

export type CardData = typeof CARD;

export const PRODUCTS = {
  cheeseburguer:     "cheeseburguer",
  btSpecial:         "bt-special",
  packTenders:       "pack-tenders",
  packTendersSpicy:  "pack-tenders-spicy",
  comboSpicyMilkshake: "combo-spicy-milkshake",
} as const;

export const SPICY_PRODUCT_IDS = [
  PRODUCTS.btSpecial,
  PRODUCTS.packTendersSpicy,
  PRODUCTS.comboSpicyMilkshake,
] as const;

export const CUSTOMER = {
  name:  "Alice",
  email: "alice@example.com",
} as const;

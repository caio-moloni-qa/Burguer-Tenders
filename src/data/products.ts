import type { Product } from "../types/product";

/**
 * Burguer-Tenders — catalog of items available to buy.
 * Single source of truth for the storefront until a backend exists.
 */
export const products: readonly Product[] = [
  /* ── Burgers ────────────────────────────────────────────────── */
  {
    id: "cheeseburguer",
    name: "Cheeseburguer",
    shortName: "Cheeseburguer",
    description:
      "Beef patty, melted cheese, pickles, onions, ketchup, and mustard on a toasted bun.",
    imageSrc: "/images/products/cheeseburguer.png",
    priceUsd: 3.49,
    category: "burger",
    spicy: false,
  },
  {
    id: "cheeseburguer-bacon",
    name: "Cheeseburguer bacon",
    shortName: "Cheeseburguer bacon",
    description:
      "Our classic cheeseburguer with crispy bacon and creamy mayo on a toasted bun.",
    imageSrc: "/images/products/cheeseburguer-bacon.png",
    priceUsd: 4.99,
    category: "burger",
    spicy: false,
  },
  {
    id: "avocado-burger",
    name: "Avocado Burguer",
    shortName: "Avocado Burguer",
    description:
      "Fresh avocado spread, beef patty, lettuce, tomato, and a tangy lime aioli on a brioche bun.",
    imageSrc: "/images/products/avocado-burger.png",
    priceUsd: 6.49,
    category: "burger",
    spicy: false,
  },
  {
    id: "bt-special",
    name: "BT Special",
    shortName: "BT Special",
    description:
      "Cheeseburguer topped with a fried egg and our signature gochujang sauce — bold heat that builds.",
    imageSrc: "/images/products/bt-special.png",
    priceUsd: 7.49,
    category: "burger",
    spicy: true,
  },

  /* ── Tenders ─────────────────────────────────────────────────── */
  {
    id: "pack-tenders",
    name: "Pack of tenders",
    shortName: "Tenders pack",
    description:
      "Six golden chicken tenders with your choice of dipping sauce.",
    imageSrc: "/images/products/pack-tenders.png",
    priceUsd: 6.99,
    category: "tenders",
    spicy: false,
  },
  {
    id: "pack-tenders-spicy",
    name: "Spicy pack of tenders",
    shortName: "Spicy tenders",
    description:
      "Six spicy breaded chicken tenders with heat that builds dip included.",
    imageSrc: "/images/products/pack-tenders-spicy.png",
    priceUsd: 7.49,
    category: "tenders",
    spicy: true,
  },

  /* ── Combos ──────────────────────────────────────────────────── */
  {
    id: "combo-tenders-cheeseburguer",
    name: "Chicken Tenders + Cheeseburguer",
    shortName: "Tenders & Burger combo",
    description:
      "Four golden tenders and a classic cheeseburguer — the best of both worlds, served together.",
    imageSrc: "/images/products/combo-tenders-cheeseburguer.png",
    priceUsd: 9.99,
    category: "combo",
    spicy: false,
  },
  {
    id: "combo-bacon-fries",
    name: "Cheeseburguer Bacon + Plain Fries",
    shortName: "Bacon Burger combo",
    description:
      "Our crispy-bacon cheeseburguer paired with a generous serving of our golden plain fries.",
    imageSrc: "/images/products/combo-bacon-fries.png",
    priceUsd: 8.49,
    category: "combo",
    spicy: false,
  },
  {
    id: "combo-spicy-milkshake",
    name: "Spicy Tenders + Chocolate Milkshake",
    shortName: "Spicy & Shake combo",
    description:
      "Six fiery spicy tenders balanced with a thick, creamy chocolate milkshake. Fire meets chill.",
    imageSrc: "/images/products/combo-spicy-milkshake.png",
    priceUsd: 10.49,
    category: "combo",
    spicy: true,
  },
  {
    id: "combo-tenders-drink",
    name: "Tenders + Drink",
    shortName: "Tenders & Drink",
    description:
      "Six golden tenders with any fountain drink of your choice. Simple, satisfying, every time.",
    imageSrc: "/images/products/combo-tenders-drink.png",
    priceUsd: 8.99,
    category: "combo",
    spicy: false,
  },

  /* ── Drinks ──────────────────────────────────────────────────── */
  {
    id: "doctor-bt",
    name: "Doctor BT",
    shortName: "Doctor BT",
    description:
      "Our house Coke-based specialty soda with a secret twist. Refreshing, sweet, and totally addictive.",
    imageSrc: "/images/products/doctor-bt.png",
    priceUsd: 2.99,
    category: "drink",
    spicy: false,
  },
  {
    id: "guarana",
    name: "Guaraná",
    shortName: "Guaraná",
    description:
      "Classic Brazilian guaraná soda — lightly sweet, fruity, and perfectly fizzy. A taste of Brazil.",
    imageSrc: "/images/products/guarana.png",
    priceUsd: 2.99,
    category: "drink",
    spicy: false,
  },

  /* ── Sides ───────────────────────────────────────────────────── */
  {
    id: "fries-plain",
    name: "Plain BT French Fries",
    shortName: "Plain Fries",
    description:
      "Crispy golden fries, lightly salted. Classic and always the right call.",
    imageSrc: "/images/products/fries-plain.png",
    priceUsd: 3.49,
    category: "side",
    spicy: false,
  },
  {
    id: "fries-lemon-pepper",
    name: "BT Fries — Lemon Pepper",
    shortName: "Lemon Pepper Fries",
    description:
      "Golden fries tossed in a bright lemon-pepper seasoning. Zesty, savory, impossible to stop eating.",
    imageSrc: "/images/products/fries-lemon-pepper.png",
    priceUsd: 3.99,
    category: "side",
    spicy: false,
  },
  {
    id: "milkshake-chocolate",
    name: "Chocolate Milkshake",
    shortName: "Chocolate Shake",
    description:
      "Thick and creamy hand-spun chocolate milkshake made with real cocoa. Served ice cold.",
    imageSrc: "/images/products/milkshake-chocolate.png",
    priceUsd: 4.49,
    category: "side",
    spicy: false,
  },
  {
    id: "milkshake-strawberry",
    name: "Strawberry Milkshake",
    shortName: "Strawberry Shake",
    description:
      "Hand-spun strawberry milkshake bursting with fresh berry flavor. Sweet, pink, and perfect.",
    imageSrc: "/images/products/milkshake-strawberry.png",
    priceUsd: 4.49,
    category: "side",
    spicy: false,
  },
];

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

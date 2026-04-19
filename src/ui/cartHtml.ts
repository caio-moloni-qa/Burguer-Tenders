import type { CartStore } from "../cart/cartStore";
import { getProductById } from "../data/products";

export function formatPrice(usd: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(usd);
}

export function renderCartLines(cart: CartStore): string {
  const lines = cart.getLines();
  if (lines.length === 0) {
    return '<p class="cart-drawer__empty">Your cart is empty.</p>';
  }

  return `<ul class="cart-lines" data-testid="cart-lines">
    ${lines
      .map((line) => {
        const product = getProductById(line.productId);
        if (!product) {
          return "";
        }
        const lineTotal = product.priceUsd * line.quantity;
        return `
        <li class="cart-line" data-product-id="${escapeHtml(line.productId)}">
          <div class="cart-line__info">
            <span class="cart-line__name">${escapeHtml(product.shortName)}</span>
            <span class="cart-line__each">${formatPrice(product.priceUsd)} each</span>
          </div>
          <div class="cart-line__controls">
            <button type="button" class="cart-line__btn" data-action="dec-line" data-product-id="${escapeHtml(line.productId)}" aria-label="Decrease ${escapeHtml(product.shortName)}">−</button>
            <span class="cart-line__qty" data-testid="cart-line-qty">${line.quantity}</span>
            <button type="button" class="cart-line__btn" data-action="inc-line" data-product-id="${escapeHtml(line.productId)}" aria-label="Increase ${escapeHtml(product.shortName)}">+</button>
            <button type="button" class="cart-line__remove" data-action="remove-line" data-product-id="${escapeHtml(line.productId)}">Remove</button>
          </div>
          <div class="cart-line__sub">${formatPrice(lineTotal)}</div>
        </li>`;
      })
      .join("")}
  </ul>`;
}

export function cartSubtotal(cart: CartStore): number {
  let total = 0;
  for (const line of cart.getLines()) {
    const p = getProductById(line.productId);
    if (p) {
      total += p.priceUsd * line.quantity;
    }
  }
  return total;
}

export function renderCartDrawerFoot(cart: CartStore): string {
  const sub = cartSubtotal(cart);
  const hasItems = cart.getLines().length > 0;
  return `
        <div class="cart-drawer__foot">
          <div class="cart-drawer__subtotal">
            <span>Subtotal</span>
            <strong data-testid="cart-subtotal">${formatPrice(sub)}</strong>
          </div>
          <div class="cart-drawer__actions">
            <button type="button" class="cart-drawer__checkout" data-action="go-checkout" data-testid="go-checkout" ${hasItems ? "" : "disabled"}>
              Go to checkout
            </button>
          </div>
        </div>`;
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

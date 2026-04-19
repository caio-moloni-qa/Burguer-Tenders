import type { CartStore } from "../cart/cartStore";
import { getStoreDisplayName } from "../data/stores";
import { getLocationPanelOpen, hasDeliveryLocation, locationDelivery } from "../location/location";
import type { Product, ProductCategory } from "../types/product";
import { escapeHtml, formatPrice, renderCartDrawerFoot, renderCartLines } from "./cartHtml";
import { renderHeaderBrand } from "./headerBrandHtml";
import { renderHeaderActionsBar } from "./headerActionsHtml";
import { renderLocationLayer } from "./locationLayerHtml";

type MenuFilter = "all" | ProductCategory;

const FILTER_LABELS: Record<MenuFilter, string> = {
  all: "All",
  burger: "Burgers",
  tenders: "Tenders",
  combo: "Combos",
  drink: "Drinks",
  side: "Sides",
};

const ALL_FILTERS: MenuFilter[] = ["all", "burger", "tenders", "combo", "drink", "side"];

let activeFilter: MenuFilter = "all";

export function setMenuFilter(filter: string): void {
  if (ALL_FILTERS.includes(filter as MenuFilter)) {
    activeFilter = filter as MenuFilter;
  }
}

export function getMenuFilter(): MenuFilter {
  return activeFilter;
}

export function renderMenu(
  container: HTMLDivElement,
  items: readonly Product[],
  cart: CartStore
): void {
  const drawerOpen = cart.isDrawerOpen();
  const canAddToCart = hasDeliveryLocation();

  const filtered = activeFilter === "all"
    ? items
    : items.filter((p) => p.category === activeFilter);

  const list = filtered
    .map(
      (p) => `
      <article class="product-card" data-product-id="${p.id}">
        <div class="product-card__media">
          <img
            class="product-card__img"
            src="${escapeHtml(p.imageSrc)}"
            alt="${escapeHtml(p.name)}"
            width="640"
            height="480"
            loading="lazy"
            decoding="async"
            data-testid="product-image"
          />
        </div>
        <div class="product-card__body">
          <div class="product-card__meta">
            <h2 class="product-card__name">${escapeHtml(p.name)}</h2>
            ${p.spicy ? '<span class="product-card__badge">Spicy</span>' : ""}
          </div>
          <p class="product-card__desc">${escapeHtml(p.description)}</p>
          <p class="product-card__price" data-price-usd="${p.priceUsd}">${formatPrice(p.priceUsd)}</p>
          <button type="button" class="product-card__add" data-action="add-to-cart" data-product-id="${escapeHtml(p.id)}" data-testid="add-to-cart" title="${canAddToCart ? "Add to cart" : "Set your delivery location first"}">
            Add to cart
          </button>
        </div>
      </article>`
    )
    .join("");

  const emptyState = filtered.length === 0
    ? `<p class="menu__empty">No items in this category yet.</p>`
    : "";

  const filterOptions = ALL_FILTERS.map(
    (f) =>
      `<option value="${f}" ${activeFilter === f ? "selected" : ""}>${escapeHtml(FILTER_LABELS[f])}</option>`
  ).join("");

  const locationOpen = getLocationPanelOpen();
  document.body.classList.toggle("cart-open", drawerOpen || locationOpen);

  const storeBanner = locationDelivery.storeId.trim()
    ? `<p class="menu__store-banner" data-testid="menu-store-banner">Ordering from <strong>${escapeHtml(getStoreDisplayName(locationDelivery.storeId))}</strong></p>`
    : "";

  container.innerHTML = `
    <header class="site-header">
      <div class="site-header__inner site-header__inner--bar">
        ${renderHeaderBrand()}
        ${renderHeaderActionsBar(cart, locationOpen)}
      </div>
    </header>
    <main class="menu">
      ${storeBanner}
      <div class="menu__toolbar">
        <h2 class="menu__heading">Available to buy</h2>
        <div class="menu__filter-wrap">
          <label class="menu__filter-label" for="menu-category-filter">Category</label>
          <select
            id="menu-category-filter"
            class="menu__filter-select"
            data-menu-filter
            data-testid="menu-category-filter"
            aria-label="Filter by category"
          >${filterOptions}</select>
        </div>
      </div>
      <div class="product-grid" data-testid="product-grid">
        ${list}${emptyState}
      </div>
    </main>
    <div class="cart-layer" aria-hidden="${!drawerOpen}" data-cart-open="${drawerOpen}">
      <button type="button" class="cart-backdrop" data-action="close-cart" aria-label="Close cart" tabindex="${drawerOpen ? 0 : -1}"></button>
      <aside class="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-drawer-title" data-testid="cart-drawer">
        <div class="cart-drawer__head">
          <h2 id="cart-drawer-title" class="cart-drawer__title">Cart</h2>
          <button type="button" class="cart-drawer__close" data-action="close-cart" aria-label="Close cart">&times;</button>
        </div>
        <div class="cart-drawer__body">
          ${renderCartLines(cart)}
        </div>
        ${renderCartDrawerFoot(cart)}
      </aside>
    </div>
    ${renderLocationLayer(locationOpen)}
  `;
}

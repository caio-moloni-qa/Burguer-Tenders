import { type Page, type Locator } from "@playwright/test";
import { LocationPanel } from "./LocationPanel";
import { CartDrawer } from "./CartDrawer";

export class MenuPage {
  readonly page: Page;

  // ── Header ──────────────────────────────────────────────────────────────────
  readonly siteLogo:       Locator;
  readonly locationToggle: Locator;
  readonly locationSummary: Locator;
  readonly locationBadge:  Locator;
  readonly cartToggle:     Locator;
  readonly cartCount:      Locator;

  // ── Catalog ─────────────────────────────────────────────────────────────────
  readonly productGrid:    Locator;
  readonly productCards:   Locator;
  readonly categoryFilter: Locator;
  readonly menuHeading:    Locator;
  readonly prices:         Locator;
  readonly storeBanner:    Locator;

  // ── Toast ────────────────────────────────────────────────────────────────────
  readonly cartToast: Locator;

  constructor(page: Page) {
    this.page = page;

    this.siteLogo        = page.locator('[data-testid="site-logo"]');
    this.locationToggle  = page.locator('[data-testid="location-toggle"]');
    this.locationSummary = page.locator('[data-testid="location-summary"]');
    this.locationBadge   = page.locator(".header-location__badge");
    this.cartToggle      = page.locator('[data-testid="cart-toggle"]');
    this.cartCount       = page.locator('[data-testid="cart-count"]');

    this.productGrid    = page.locator('[data-testid="product-grid"]');
    this.productCards   = page.locator('[data-testid="product-grid"] .product-card');
    this.categoryFilter = page.locator('[data-testid="menu-category-filter"]');
    this.menuHeading    = page.locator("h2.menu__heading");
    this.prices         = page.locator(".product-card__price");
    this.storeBanner    = page.locator('[data-testid="menu-store-banner"]');

    this.cartToast = page.locator('[data-testid="cart-toast"]');
  }

  // ── Contextual locators ─────────────────────────────────────────────────────

  productCard(productId: string): Locator {
    return this.page.locator(`[data-product-id="${productId}"]`);
  }

  addToCartBtn(productId: string): Locator {
    return this.page.locator(`[data-product-id="${productId}"] [data-testid="add-to-cart"]`);
  }

  productImage(productId: string): Locator {
    return this.page.locator(`[data-product-id="${productId}"] [data-testid="product-image"]`);
  }

  spicyBadge(productId: string): Locator {
    return this.page.locator(`[data-product-id="${productId}"] .product-card__badge`);
  }

  // ── Actions ─────────────────────────────────────────────────────────────────

  async goto(): Promise<void> {
    await this.page.goto("/");
  }

  async filterByCategory(category: string): Promise<void> {
    await this.categoryFilter.selectOption(category);
  }

  async addToCart(productId: string): Promise<void> {
    await this.addToCartBtn(productId).click();
  }

  async openLocation(): Promise<LocationPanel> {
    const panel = new LocationPanel(this.page);
    await panel.open();
    return panel;
  }

  async openCart(): Promise<CartDrawer> {
    await this.cartToggle.click();
    return new CartDrawer(this.page);
  }

  async clickLogo(): Promise<void> {
    await this.siteLogo.click();
  }
}

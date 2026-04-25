import { type Page, type Locator } from "@playwright/test";
import { TIMEOUTS } from "../global.config";
import { CheckoutPage } from "./CheckoutPage";

export class CartDrawer {
  readonly page: Page;

  readonly drawer:       Locator;
  readonly closeBtn:     Locator;
  readonly incLine:      Locator;
  readonly decLine:      Locator;
  readonly removeLine:   Locator;
  readonly lineQty:      Locator;
  readonly lineTotal:    Locator;
  readonly subtotal:     Locator;
  readonly goCheckoutBtn: Locator;
  readonly emptyState:   Locator;
  readonly title:        Locator;

  constructor(page: Page) {
    this.page = page;

    this.drawer        = page.locator('[data-testid="cart-drawer"]');
    this.closeBtn      = page.locator('[data-action="close-cart"]');
    this.incLine       = page.locator('[data-action="inc-line"]');
    this.decLine       = page.locator('[data-action="dec-line"]');
    this.removeLine    = page.locator('[data-action="remove-line"]');
    this.lineQty       = page.locator('[data-testid="cart-line-qty"]');
    this.lineTotal     = page.locator('[data-testid="line-total"]');
    this.subtotal      = page.locator('[data-testid="cart-subtotal"]');
    this.goCheckoutBtn = page.locator('[data-testid="go-checkout"]');
    this.emptyState    = page.locator(".cart-drawer__empty");
    this.title         = page.locator(".cart-drawer__title");
  }

  // ── Actions ─────────────────────────────────────────────────────────────────

  async close(): Promise<void> {
    await this.closeBtn.click();
  }

  async increment(): Promise<void> {
    await this.incLine.click();
  }

  async decrement(): Promise<void> {
    await this.decLine.click();
  }

  async removeItem(): Promise<void> {
    await this.removeLine.click();
  }

  /**
   * Click "Go to checkout", wait for the spinner overlay to appear and
   * disappear, then return a CheckoutPage instance.
   */
  async goToCheckout(): Promise<CheckoutPage> {
    await this.goCheckoutBtn.click();
    await this.page.waitForSelector(".page-spinner-overlay", { state: "visible" });
    await this.page.waitForSelector(".page-spinner-overlay", {
      state: "hidden",
      timeout: TIMEOUTS.checkoutSpinner,
    });
    await this.page.waitForSelector('[data-testid="checkout-page"]');
    return new CheckoutPage(this.page);
  }
}

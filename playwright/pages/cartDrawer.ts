import type { Locator, Page } from "@playwright/test";

export class CartDrawer {
  readonly drawer: Locator;
  readonly title: Locator;
  readonly emptyState: Locator;
  readonly lines: Locator;
  readonly subtotal: Locator;
  readonly goCheckout: Locator;
  readonly closeButton: Locator;

  constructor(private readonly page: Page) {
    this.drawer = page.getByTestId("cart-drawer");
    this.title = page.locator("#cart-drawer-title");
    this.emptyState = page.getByTestId("cart-empty");
    this.lines = page.getByTestId("cart-lines");
    this.subtotal = page.getByTestId("cart-subtotal");
    this.goCheckout = page.getByTestId("go-checkout");
    this.closeButton = page.locator('button[data-action="close-cart"]');
  }

  lineTotal(): Locator {
    return this.page.getByTestId("line-total").first();
  }

  lineQuantity(): Locator {
    return this.page.getByTestId("cart-line-qty");
  }

  async incrementFirstLine(): Promise<void> {
    await this.page.locator('[data-action="inc-line"]').first().click();
  }

  async decrementFirstLine(): Promise<void> {
    await this.page.locator('[data-action="dec-line"]').first().click();
  }

  async removeFirstLine(): Promise<void> {
    await this.page.locator('[data-action="remove-line"]').first().click();
  }

  async close(): Promise<void> {
    await this.closeButton.click();
  }
}

import type { Locator, Page } from "@playwright/test";

export class Header {
  readonly cartToggle: Locator;
  readonly cartCount: Locator;
  readonly locationToggle: Locator;
  readonly storeBanner: Locator;

  constructor(private readonly page: Page) {
    this.cartToggle = page.getByTestId("cart-toggle");
    this.cartCount = page.getByTestId("cart-count");
    this.locationToggle = page.getByTestId("location-toggle");
    this.storeBanner = page.getByTestId("menu-store-banner");
  }

  async openCart(): Promise<void> {
    await this.cartToggle.click();
  }

  async openLocation(): Promise<void> {
    await this.locationToggle.click();
  }
}

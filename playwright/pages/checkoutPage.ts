import type { Locator, Page } from "@playwright/test";
import { CARD } from "../data/testData";

export class CheckoutPage {
  readonly pageRoot: Locator;
  readonly title: Locator;
  readonly backToShop: Locator;
  readonly name: Locator;
  readonly email: Locator;
  readonly cardName: Locator;
  readonly cardNumber: Locator;
  readonly cardExpiry: Locator;
  readonly cardCvc: Locator;
  readonly storeName: Locator;
  readonly placeOrder: Locator;

  constructor(private readonly page: Page) {
    this.pageRoot = page.getByTestId("checkout-page");
    this.title = this.pageRoot.getByRole("heading");
    this.backToShop = page.getByTestId("back-to-shop");
    this.name = page.getByTestId("checkout-name");
    this.email = page.getByTestId("checkout-email");
    this.cardName = page.getByTestId("checkout-card-name");
    this.cardNumber = page.getByTestId("checkout-card-number");
    this.cardExpiry = page.getByTestId("checkout-card-expiry");
    this.cardCvc = page.getByTestId("checkout-card-cvc");
    this.storeName = page.getByTestId("checkout-store-name");
    this.placeOrder = page.getByTestId("place-order");
  }

  error(field: string): Locator {
    return this.page.getByTestId(`checkout-error-${field}`);
  }

  async fillPersonalDetails(name = "Alice", email = "alice@example.com"): Promise<void> {
    await this.name.fill(name);
    await this.email.fill(email);
  }

  async fillValidCard(): Promise<void> {
    await this.cardName.fill(CARD.name);
    await this.cardNumber.fill(CARD.number);
    await this.cardExpiry.fill(CARD.expiry);
    await this.cardCvc.fill(CARD.cvc);
  }

  async fillCard(fields: {
    name?: string;
    number?: string;
    expiry?: string;
    cvc?: string;
  }): Promise<void> {
    if (fields.name !== undefined) {
      await this.cardName.fill(fields.name);
    }
    if (fields.number !== undefined) {
      await this.cardNumber.fill(fields.number);
    }
    if (fields.expiry !== undefined) {
      await this.cardExpiry.fill(fields.expiry);
    }
    if (fields.cvc !== undefined) {
      await this.cardCvc.fill(fields.cvc);
    }
  }

  async placeOrderNow(): Promise<void> {
    await this.placeOrder.click();
  }

  async goBackToShop(): Promise<void> {
    await this.backToShop.click();
  }
}

import { type Page, type Locator } from "@playwright/test";
import { CARD, type CardData } from "../data/test-data";
import { ConfirmationPage } from "./ConfirmationPage";

export class CheckoutPage {
  readonly page: Page;

  readonly checkoutPage:       Locator;
  readonly title:              Locator;
  readonly backToShopBtn:      Locator;
  readonly placeOrderBtn:      Locator;

  // Personal details
  readonly nameInput:          Locator;
  readonly emailInput:         Locator;

  // Card fields
  readonly cardNameInput:      Locator;
  readonly cardNumberInput:    Locator;
  readonly cardExpiryInput:    Locator;
  readonly cardCvcInput:       Locator;

  // Delivery (read-only)
  readonly zipInput:           Locator;
  readonly streetInput:        Locator;
  readonly neighborhoodInput:  Locator;
  readonly cityStateInput:     Locator;
  readonly countryInput:       Locator;
  readonly storeName:          Locator;

  constructor(page: Page) {
    this.page = page;

    this.checkoutPage      = page.locator('[data-testid="checkout-page"]');
    this.title             = page.locator("h2.checkout-page__title");
    this.backToShopBtn     = page.locator('[data-testid="back-to-shop"]');
    this.placeOrderBtn     = page.locator('[data-testid="place-order"]');

    this.nameInput         = page.locator('[data-testid="checkout-name"]');
    this.emailInput        = page.locator('[data-testid="checkout-email"]');

    this.cardNameInput     = page.locator('[data-testid="checkout-card-name"]');
    this.cardNumberInput   = page.locator('[data-testid="checkout-card-number"]');
    this.cardExpiryInput   = page.locator('[data-testid="checkout-card-expiry"]');
    this.cardCvcInput      = page.locator('[data-testid="checkout-card-cvc"]');

    this.zipInput          = page.locator('[data-testid="checkout-zip"]');
    this.streetInput       = page.locator('[data-testid="checkout-street"]');
    this.neighborhoodInput = page.locator('[data-testid="checkout-neighborhood"]');
    this.cityStateInput    = page.locator('[data-testid="checkout-city-state"]');
    this.countryInput      = page.locator('[data-testid="checkout-country"]');
    this.storeName         = page.locator('[data-testid="checkout-store-name"]');
  }

  // ── Contextual locators ─────────────────────────────────────────────────────

  errorFor(field: string): Locator {
    return this.page.locator(`[data-testid="checkout-error-${field}"]`);
  }

  deliveryField(testId: string): Locator {
    return this.page.locator(`[data-testid="${testId}"]`);
  }

  // ── Actions ─────────────────────────────────────────────────────────────────

  async fillPersonalDetails(name = "Alice", email = "alice@example.com"): Promise<void> {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
  }

  async fillCard(card: CardData = CARD): Promise<void> {
    await this.cardNameInput.fill(card.name);
    await this.cardNumberInput.fill(card.number);
    await this.cardExpiryInput.fill(card.expiry);
    await this.cardCvcInput.fill(card.cvc);
  }

  async goBack(): Promise<void> {
    await this.backToShopBtn.click();
  }

  /**
   * Click "Place order" and return a ConfirmationPage instance.
   */
  async placeOrder(): Promise<ConfirmationPage> {
    await this.placeOrderBtn.click();
    return new ConfirmationPage(this.page);
  }
}

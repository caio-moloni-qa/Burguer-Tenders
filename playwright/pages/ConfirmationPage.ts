import { type Page, type Locator } from "@playwright/test";

export class ConfirmationPage {
  readonly page: Page;

  readonly confirmPage: Locator;
  readonly title:       Locator;
  readonly subtitle:    Locator;
  readonly eta:         Locator;
  readonly etaIcon:     Locator;
  readonly address:     Locator;
  readonly backBtn:     Locator;

  constructor(page: Page) {
    this.page = page;

    this.confirmPage = page.locator('[data-testid="confirmation-page"]');
    this.title       = page.locator('[data-testid="confirm-title"]');
    this.subtitle    = page.locator(".confirm-card__subtitle");
    this.eta         = page.locator('[data-testid="confirm-eta"]');
    this.etaIcon     = page.locator('[data-testid="confirm-eta"] img');
    this.address     = page.locator('[data-testid="confirm-address"]');
    this.backBtn     = page.locator('[data-testid="confirm-back"]');
  }

  async goBack(): Promise<void> {
    await this.backBtn.click();
  }
}

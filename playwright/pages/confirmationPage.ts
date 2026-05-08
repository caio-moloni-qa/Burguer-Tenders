import type { Locator, Page } from "@playwright/test";

export class ConfirmationPage {
  readonly pageRoot: Locator;
  readonly title: Locator;
  readonly subtitle: Locator;
  readonly eta: Locator;
  readonly backToMenu: Locator;

  constructor(private readonly page: Page) {
    this.pageRoot = page.getByTestId("confirmation-page");
    this.title = page.getByTestId("confirm-title");
    this.subtitle = page.getByText(/Your order is placed!|Seu pedido foi realizado!/);
    this.eta = page.getByTestId("confirm-eta");
    this.backToMenu = page.getByTestId("confirm-back");
  }

  async back(): Promise<void> {
    await this.backToMenu.click();
  }
}

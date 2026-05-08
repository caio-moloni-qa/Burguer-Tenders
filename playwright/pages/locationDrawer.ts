import { expect, type Locator, type Page } from "@playwright/test";
import type { CountryCode } from "../data/testData";

export class LocationDrawer {
  readonly panel: Locator;
  readonly closeButton: Locator;
  readonly backdrop: Locator;
  readonly country: Locator;
  readonly zip: Locator;
  readonly lookup: Locator;
  readonly lookupProgress: Locator;
  readonly save: Locator;
  readonly storesList: Locator;
  readonly storeStatus: Locator;
  readonly street: Locator;
  readonly city: Locator;
  readonly state: Locator;
  readonly complement: Locator;

  constructor(private readonly page: Page) {
    this.panel = page.getByTestId("location-panel");
    this.closeButton = page.locator('button[data-action="close-location"]');
    this.backdrop = page.locator('.MuiBackdrop-root[data-action="close-location"]');
    this.country = page.getByTestId("location-country");
    this.zip = page.getByTestId("location-zip");
    this.lookup = page.getByTestId("location-lookup");
    this.lookupProgress = this.lookup.getByRole("progressbar");
    this.save = page.getByTestId("location-save");
    this.storesList = page.getByTestId("location-stores-list");
    this.storeStatus = page.getByTestId("location-store-status");
    this.street = page.getByTestId("location-street");
    this.city = page.getByTestId("location-city");
    this.state = page.getByTestId("location-state");
    this.complement = page.getByTestId("location-complement");
  }

  async selectCountry(country: CountryCode): Promise<void> {
    await this.country.locator("xpath=ancestor::*[contains(@class,'MuiInputBase-root')]").click();
    const option =
      country === "BR"
        ? this.page.getByRole("option", { name: "Brazil" }).or(
            this.page.getByRole("option", { name: "Brasil" })
          )
        : this.page.getByRole("option", { name: "United States" }).or(
            this.page.getByRole("option", { name: "Estados Unidos" })
          );
    await option.click();
  }

  async beginLookup(zip: string, country: CountryCode): Promise<void> {
    await this.selectCountry(country);
    await this.zip.fill(zip);
    await this.lookup.click();
  }

  async lookupAddress(zip: string, country: CountryCode): Promise<void> {
    await this.beginLookup(zip, country);
    await expect(this.lookup).toBeEnabled({ timeout: 20_000 });
  }

  async saveLocation(zip: string, country: CountryCode): Promise<void> {
    await this.lookupAddress(zip, country);
    await this.save.waitFor({ state: "visible", timeout: 3_000 });
    await expect(this.save).toBeEnabled({ timeout: 3_000 });
    await this.save.click();
    await expect(this.panel).not.toBeInViewport({ timeout: 5_000 });
  }

  async close(): Promise<void> {
    await this.closeButton.click();
  }

  async closeByBackdrop(): Promise<void> {
    await this.backdrop.click();
  }

  async typeZipWithKeyboard(zip: string): Promise<void> {
    await this.zip.click();
    await this.page.keyboard.type(zip);
  }
}

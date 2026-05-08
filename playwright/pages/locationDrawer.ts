import type { Locator, Page } from "@playwright/test";
import type { CountryCode } from "../data/testData";

export class LocationDrawer {
  readonly panel: Locator;
  readonly country: Locator;
  readonly zip: Locator;
  readonly lookup: Locator;
  readonly save: Locator;
  readonly storesList: Locator;
  readonly storeStatus: Locator;
  readonly complement: Locator;

  constructor(private readonly page: Page) {
    this.panel = page.getByTestId("location-panel");
    this.country = page.getByTestId("location-country");
    this.zip = page.getByTestId("location-zip");
    this.lookup = page.getByTestId("location-lookup");
    this.save = page.getByTestId("location-save");
    this.storesList = page.getByTestId("location-stores-list");
    this.storeStatus = page.getByTestId("location-store-status");
    this.complement = page.getByTestId("location-complement");
  }

  async lookupAddress(zip: string, country: CountryCode): Promise<void> {
    await this.country.locator("xpath=ancestor::*[contains(@class,'MuiInputBase-root')]").click();
    await this.page.getByRole("option", {
      name: country === "BR" ? /Brazil|Brasil/ : /United States|Estados Unidos/,
    }).click();
    await this.zip.fill(zip);
    await this.lookup.click();
    await this.lookup.locator(".location-lookup-btn__spinner").waitFor({
      state: "attached",
      timeout: 5_000,
    }).catch(() => {});
    await this.lookup.locator(".location-lookup-btn__spinner").waitFor({
      state: "detached",
      timeout: 20_000,
    });
  }

  async saveLocation(zip: string, country: CountryCode): Promise<void> {
    await this.lookupAddress(zip, country);
    await this.save.waitFor({ state: "visible", timeout: 3_000 });
    await this.page.waitForSelector('[data-testid="location-save"]:not([disabled])', {
      timeout: 3_000,
    });
    await this.save.click();
  }
}

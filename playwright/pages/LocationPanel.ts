import { type Page, type Locator } from "@playwright/test";
import { TIMEOUTS } from "../global.config";
import { type Country } from "../data/test-data";

export class LocationPanel {
  readonly page: Page;

  readonly panel:          Locator;
  readonly countrySelect:  Locator;
  readonly zipInput:       Locator;
  readonly lookupBtn:      Locator;
  readonly lookupSpinner:  Locator;
  readonly saveBtn:        Locator;
  readonly closeBtn:       Locator;
  readonly backdrop:       Locator;
  readonly storeStatus:    Locator;
  readonly storesList:     Locator;
  readonly streetInput:    Locator;
  readonly cityInput:      Locator;
  readonly stateInput:     Locator;
  readonly complementInput: Locator;

  constructor(page: Page) {
    this.page = page;

    this.panel           = page.locator('[data-testid="location-panel"]');
    this.countrySelect   = page.locator('[data-testid="location-country"]');
    this.zipInput        = page.locator('[data-testid="location-zip"]');
    this.lookupBtn       = page.locator('[data-testid="location-lookup"]');
    this.lookupSpinner   = page.locator('[data-testid="location-lookup"] .location-lookup-btn__spinner');
    this.saveBtn         = page.locator('[data-testid="location-save"]');
    this.closeBtn        = page.locator('[data-action="close-location"]');
    this.backdrop        = page.locator(".location-backdrop");
    this.storeStatus     = page.locator('[data-testid="location-store-status"]');
    this.storesList      = page.locator('[data-testid="location-stores-list"]');
    this.streetInput     = page.locator('[data-testid="location-street"]');
    this.cityInput       = page.locator('[data-testid="location-city"]');
    this.stateInput      = page.locator('[data-testid="location-state"]');
    this.complementInput = page.locator('[data-testid="location-complement"]');
  }

  // ── Navigation ──────────────────────────────────────────────────────────────

  async open(): Promise<void> {
    await this.page.locator('[data-testid="location-toggle"]').click();
    await this.panel.waitFor({ state: "attached" });
  }

  async close(): Promise<void> {
    await this.closeBtn.click();
  }

  async closeViaEscape(): Promise<void> {
    await this.page.keyboard.press("Escape");
  }

  async closeViaBackdrop(): Promise<void> {
    await this.backdrop.click();
  }

  // ── Interactions ────────────────────────────────────────────────────────────

  async selectCountry(country: Country): Promise<void> {
    await this.countrySelect.selectOption(country);
  }

  async fillZip(zip: string): Promise<void> {
    await this.zipInput.fill(zip);
  }

  /** Click Look Up and wait for the geocoding request to complete. */
  async lookup(): Promise<void> {
    await this.lookupBtn.click();

    await this.lookupSpinner
      .waitFor({ state: "attached", timeout: TIMEOUTS.spinnerAppear })
      .catch(() => { /* spinner may already be gone on very fast responses */ });

    await this.lookupSpinner.waitFor({ state: "detached", timeout: TIMEOUTS.geocoding });
  }

  /** Click Save location (waits for the button to re-enable first). */
  async save(): Promise<void> {
    await this.page
      .locator('[data-testid="location-save"]:not([disabled])')
      .waitFor({ timeout: TIMEOUTS.saveReEnable });

    await this.saveBtn.click();
    await this.panel.waitFor({ state: "attached" });
  }

  // ── Compound flows ──────────────────────────────────────────────────────────

  /**
   * Fill in country + ZIP, run the geocoding lookup, and close the panel
   * WITHOUT saving.  Panel remains open after this call.
   */
  async lookupAddress(zip: string, country: Country): Promise<void> {
    await this.open();
    await this.selectCountry(country);
    await this.fillZip(zip);
    await this.lookup();
  }

  /**
   * Complete the full location flow: open panel → select country → fill ZIP
   * → lookup → save → panel closes.
   */
  async saveLocation(zip: string, country: Country): Promise<void> {
    await this.open();
    await this.selectCountry(country);
    await this.fillZip(zip);
    await this.lookup();
    await this.save();
  }
}

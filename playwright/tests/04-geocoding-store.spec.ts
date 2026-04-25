import { test, expect } from "@playwright/test";
import { MenuPage, LocationPanel } from "../pages";
import { ZIPS } from "../data/test-data";

test.describe("Suite 04 — Address Geocoding & Store Resolution", () => {
  let menu: MenuPage;
  let location: LocationPanel;

  test.beforeEach(async ({ page }) => {
    menu     = new MenuPage(page);
    location = new LocationPanel(page);
    await menu.goto();
  });

  test("TC-04-01 — Londrina BR ZIP resolves to Burguer-Tenders Higienopolis", async () => {
    await location.lookupAddress(ZIPS.londrina.zip, "BR");
    await expect(location.storeStatus).toContainText(ZIPS.londrina.store);
  });

  test("TC-04-02 — São Paulo BR ZIP resolves to Burguer-Tenders Pinheiros", async () => {
    await location.lookupAddress(ZIPS.saoPaulo.zip, "BR");
    await expect(location.storeStatus).toContainText(ZIPS.saoPaulo.store);
  });

  test("TC-04-03 — New York US ZIP resolves to Burguer-Tenders Midtown", async () => {
    await location.lookupAddress(ZIPS.newYork.zip, "US");
    await expect(location.storeStatus).toContainText(ZIPS.newYork.store);
  });

  test("TC-04-04 — Unknown city ZIP shows no-delivery message", async () => {
    await location.lookupAddress(ZIPS.curitiba.zip, "BR");
    await expect(location.storeStatus)
      .toContainText("We don't deliver to this city yet");
  });

  test("TC-04-05 — Address fields are populated after a successful lookup", async () => {
    await location.lookupAddress(ZIPS.saoPaulo.zip, "BR");
    await expect(location.streetInput).not.toBeEmpty();
    await expect(location.cityInput).not.toBeEmpty();
    await expect(location.stateInput).not.toBeEmpty();
  });

  test("TC-04-06 — Lookup button is disabled while request is in flight", async () => {
    await location.open();
    await location.selectCountry("BR");
    await location.fillZip(ZIPS.saoPaulo.zip);

    await location.lookupBtn.click();
    await expect(location.lookupBtn).toBeDisabled();
    await expect(location.lookupSpinner).toBeVisible();
  });

  test("TC-04-07 — Complement field value is preserved after lookup", async () => {
    await location.open();
    await location.complementInput.fill("Apt 42");
    await location.selectCountry("BR");
    await location.fillZip(ZIPS.saoPaulo.zip);
    await location.lookup();

    await expect(location.complementInput).toHaveValue("Apt 42");
  });

  test("TC-04-08 — Saving a valid location persists across page reload", async ({ page }) => {
    await location.saveLocation(ZIPS.londrina.zip, ZIPS.londrina.country);
    await expect(menu.locationSummary).toBeVisible();

    await page.reload();
    await page.waitForSelector('[data-testid="product-grid"]');
    await expect(menu.locationSummary).toBeVisible();
  });
});

import { test, expect } from "../helpers/fixtures";
import { ZIPS } from "../data/testData";

test.describe("Address Geocoding & Store Resolution", () => {
  test.beforeEach(async ({ app }) => {
    await app.gotoMenu();
  });

  test("Londrina BR ZIP resolves to BeeTee's Higienopolis", async ({ app }) => {
    await app.lookupAddress(ZIPS.londrina.zip, "BR");
    await expect(app.location.storeStatus).toContainText(ZIPS.londrina.store);
  });

  test("Sao Paulo BR ZIP resolves to BeeTee's Pinheiros", async ({ app }) => {
    await app.lookupAddress(ZIPS.saoPaulo.zip, "BR");
    await expect(app.location.storeStatus).toContainText(ZIPS.saoPaulo.store);
  });

  test("New York US ZIP resolves to BeeTee's Midtown", async ({ app }) => {
    await app.lookupAddress(ZIPS.newYork.zip, "US");
    await expect(app.location.storeStatus).toContainText(ZIPS.newYork.store);
  });

  test("Unknown city ZIP shows no-delivery message", async ({ app }) => {
    await app.lookupAddress(ZIPS.curitiba.zip, "BR");
    await expect(app.location.storeStatus).toContainText(
      /don't deliver to this city yet|não entregamos nesta cidade/i
    );
  });

  test("Address fields are populated after a successful lookup", async ({ app }) => {
    await app.lookupAddress(ZIPS.saoPaulo.zip, "BR");
    await expect(app.location.street).not.toBeEmpty();
    await expect(app.location.city).not.toBeEmpty();
    await expect(app.location.state).not.toBeEmpty();
  });

  test("Lookup button is disabled while request is in flight", async ({ app }) => {
    await app.header.openLocation();
    await app.location.beginLookup(ZIPS.saoPaulo.zip, "BR");

    await expect(app.location.lookup).toBeDisabled();
    await expect(app.location.lookupProgress).toBeVisible();
  });

  test("Complement field value is preserved after lookup", async ({ app }) => {
    await app.header.openLocation();
    await app.location.complement.fill("Apt 42");
    await app.location.lookupAddress(ZIPS.saoPaulo.zip, "BR");

    await expect(app.location.complement).toHaveValue("Apt 42");
  });

  test("Saving a valid location persists across page reload", async ({ app }) => {
    await app.saveLocation(ZIPS.londrina.zip, ZIPS.londrina.country);
    await expect(app.header.locationSetIndicator).toBeVisible();

    await app.reloadToMenu();
    await expect(app.header.locationSetIndicator).toBeVisible();
  });
});

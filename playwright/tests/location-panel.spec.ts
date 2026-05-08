import { test, expect } from "../helpers/fixtures";
import { ZIPS } from "../data/testData";

test.describe("Delivery Location Panel", () => {
  test.beforeEach(async ({ app }) => {
    await app.gotoMenu();
  });

  test("Location panel opens on clicking the pin icon", async ({ app }) => {
    await app.header.openLocation();
    await expect(app.location.panel).toBeVisible();
  });

  test("Location panel closes on X button", async ({ app }) => {
    await app.header.openLocation();
    await app.location.close();
    await expect(app.location.panel).not.toBeInViewport();
  });

  test("Location panel closes on backdrop click", async ({ app }) => {
    await app.header.openLocation();
    await app.location.closeByBackdrop();
    await expect(app.location.panel).not.toBeInViewport();
  });

  test("Location panel closes on Escape key", async ({ app }) => {
    await app.header.openLocation();
    await app.pressEscape();
    await expect(app.location.panel).not.toBeInViewport();
  });

  test("Only one panel open: cart drawer excludes location panel", async ({ app }) => {
    await app.saveLocation(ZIPS.saoPaulo.zip, ZIPS.saoPaulo.country);
    await app.header.openCart();
    await expect(app.cart.drawer).toBeVisible();
    await expect(app.location.panel).not.toBeInViewport();
  });

  test("Only one panel open: location panel excludes cart drawer", async ({ app }) => {
    await app.saveLocation(ZIPS.saoPaulo.zip, ZIPS.saoPaulo.country);
    await app.header.openLocation();
    await expect(app.location.panel).toBeVisible();
    await expect(app.cart.drawer).not.toBeInViewport();
  });

  test("Country selector changes the store list", async ({ app }) => {
    await app.header.openLocation();
    await expect(app.location.storesList).toContainText("BeeTee's Midtown");

    await app.location.selectCountry("BR");
    await expect(app.location.storesList).toContainText("BeeTee's Higienopolis");
  });

  test("Typing in location inputs does not lose focus", async ({ app }) => {
    await app.header.openLocation();
    await app.location.typeZipWithKeyboard("12345");
    await expect(app.location.zip).toBeFocused();
    await expect(app.location.zip).toHaveValue("12345");
  });

  test("Cannot save location without a deliverable address", async ({ app }) => {
    await app.header.openLocation();
    await app.location.zip.fill("00000");
    app.dismissNextDialog();
    await app.location.save.click();
    await expect(app.location.panel).toBeVisible();
  });

  test("Location indicator appears in header after save", async ({ app }) => {
    await app.saveLocation(ZIPS.londrina.zip, ZIPS.londrina.country);
    await expect(app.header.locationSetIndicator).toBeVisible();
  });
});

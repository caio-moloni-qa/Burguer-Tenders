import { test, expect } from "@playwright/test";
import { saveLocation, ZIPS } from "./helpers";

test.describe("Suite 03 — Delivery Location Panel", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("TC-03-01 — Location panel opens on clicking the pin icon", async ({ page }) => {
    await page.click('[data-testid="location-toggle"]');
    await expect(page.locator('[data-testid="location-panel"]')).toBeVisible();
  });

  test("TC-03-02 — Location panel closes on X button", async ({ page }) => {
    await page.click('[data-testid="location-toggle"]');
    await page.click('[data-action="close-location"]');
    await expect(page.locator('[data-testid="location-country"]')).not.toBeInViewport();
  });

  test("TC-03-03 — Location panel closes on backdrop click", async ({ page }) => {
    await page.click('[data-testid="location-toggle"]');
    await page.click(".location-backdrop");
    await expect(page.locator('[data-testid="location-panel"]')).not.toBeInViewport();;
  });

  test("TC-03-04 — Location panel closes on Escape key", async ({ page }) => {
    await page.click('[data-testid="location-toggle"]');
    await page.keyboard.press("Escape");
    await expect(page.locator('[data-testid="location-panel"]')).not.toBeInViewport();;
  });

  test("TC-03-05 — Only one panel open: cart closes when location opens", async ({ page }) => {
    await saveLocation(page, ZIPS.saoPaulo.zip, ZIPS.saoPaulo.country);
    await page.click('[data-testid="cart-toggle"]');
    await expect(page.locator('[data-testid="cart-drawer"]')).toBeVisible();

    await page.click('[data-testid="location-toggle"]');
    await expect(page.locator('[data-testid="cart-drawer"]')).not.toBeInViewport();;
    await expect(page.locator('[data-testid="location-panel"]')).toBeVisible();
  });

  test("TC-03-06 — Only one panel open: location closes when cart opens", async ({ page }) => {
    await saveLocation(page, ZIPS.saoPaulo.zip, ZIPS.saoPaulo.country);
    await page.click('[data-testid="location-toggle"]');
    await expect(page.locator('[data-testid="location-panel"]')).toBeVisible();

    await page.click('[data-testid="cart-toggle"]');
    await expect(page.locator('[data-testid="location-panel"]')).not.toBeInViewport();;
    await expect(page.locator('[data-testid="cart-drawer"]')).toBeVisible();
  });

  test("TC-03-07 — Country selector changes the store list", async ({ page }) => {
    await page.click('[data-testid="location-toggle"]');
    await expect(page.locator('[data-testid="location-stores-list"]')).toContainText("Burguer-Tenders Higienopolis");

    await page.selectOption('[data-testid="location-country"]', "US");
    await expect(page.locator('[data-testid="location-stores-list"]')).toContainText("Burguer-Tenders Midtown");
  });

  test("TC-03-08 — Typing in location inputs does not lose focus", async ({ page }) => {
    await page.click('[data-testid="location-toggle"]');
    const zipInput = page.locator('[data-testid="location-zip"]');
    await zipInput.click();
    await page.keyboard.type("12345");
    await expect(zipInput).toBeFocused();
    await expect(zipInput).toHaveValue("12345");
  });

  test("TC-03-09 — Cannot save location without a deliverable address", async ({ page }) => {
    await page.click('[data-testid="location-toggle"]');
    await page.fill('[data-testid="location-zip"]', "00000");
    page.once("dialog", (dialog) => dialog.dismiss());
    await page.click('[data-testid="location-save"]');
    await expect(page.locator('[data-testid="location-panel"]')).toBeVisible();
  });

  test("TC-03-10 — Location summary appears in header after save", async ({ page }) => {
    await saveLocation(page, ZIPS.londrina.zip, ZIPS.londrina.country);
    await expect(page.locator('[data-testid="location-summary"]')).toBeVisible();
  });
});

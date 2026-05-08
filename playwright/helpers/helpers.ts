import { Page } from "@playwright/test";
import { App } from "../pages/app";
import { CARD, ZIPS, type CountryCode } from "../data/testData";

export { CARD, ZIPS };

export async function saveLocation(
  page: Page,
  zip: string,
  country: CountryCode
): Promise<void> {
  await new App(page).saveLocation(zip, country);
}

export async function addToCart(page: Page, productId: string): Promise<void> {
  await new App(page).addToCart(productId);
}

export async function goToCheckout(page: Page): Promise<void> {
  await new App(page).goToCheckout();
}

export async function fillValidCard(page: Page): Promise<void> {
  await new App(page).checkout.fillValidCard();
}

export async function lookupAddress(
  page: Page,
  zip: string,
  country: CountryCode
): Promise<void> {
  await new App(page).lookupAddress(zip, country);
}

export async function fillPersonalDetails(
  page: Page,
  name = "Alice",
  email = "alice@example.com"
): Promise<void> {
  await new App(page).checkout.fillPersonalDetails(name, email);
}

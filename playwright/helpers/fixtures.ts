import { test as base } from "@playwright/test";
import { App } from "../pages/app";

type AppFixtures = {
  app: App;
};

export const test = base.extend<AppFixtures>({
  app: async ({ page }, use) => {
    await use(new App(page));
  },
});

export { expect } from "@playwright/test";

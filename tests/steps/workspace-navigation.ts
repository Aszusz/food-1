import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";

const { When, Then } = createBdd();
const workspaceSections = ["Recipes", "Shopping", "Settings"];

When(
  "I select {string} from workspace navigation",
  async ({ page }, section: string) => {
    await page.getByRole("link", { name: section, exact: true }).click();
  },
);

Then(
  "I should be viewing the {string} workspace",
  async ({ page }, section: string) => {
    await expect(page).toHaveURL(new RegExp(`/${section.toLowerCase()}$`));
  },
);

Then(
  "I should see workspace navigation for {string}",
  async ({ page }, householdName: string) => {
    await expect(page.getByText(householdName, { exact: true })).toBeVisible();
    for (const section of workspaceSections) {
      await expect(
        page.getByRole("link", { name: section, exact: true }),
      ).toBeVisible();
    }
  },
);

Then(
  "the {string} navigation control should be selected",
  async ({ page }, section: string) => {
    await expect(
      page.getByRole("link", { name: section, exact: true }),
    ).toHaveAttribute("aria-current", "page");
  },
);

Then("I should see the New Recipe action", async ({ page }) => {
  await expect(actionControl(page, "New Recipe")).toBeVisible();
});

Then("I should see the Add Item action", async ({ page }) => {
  await expect(actionControl(page, "Add Item")).toBeVisible();
});

Then("I should see the Settings entry links", async ({ page }) => {
  for (const section of ["Household", "Profile", "App Settings"]) {
    await expect(
      page.getByRole("link", { name: section, exact: true }),
    ).toBeVisible();
  }
});

Then("workspace navigation should not be available", async ({ page }) => {
  for (const section of workspaceSections) {
    await expect(
      page.getByRole("link", { name: section, exact: true }),
    ).toHaveCount(0);
  }
});

function actionControl(page: import("@playwright/test").Page, name: string) {
  return page
    .getByRole("link", { name, exact: true })
    .or(page.getByRole("button", { name, exact: true }));
}

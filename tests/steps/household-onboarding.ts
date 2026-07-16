import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";

const { When, Then } = createBdd();

When("I refresh the page", async ({ page }) => {
  await page.reload();
});

When("I create a household named {string}", async ({ page }, name: string) => {
  await page.getByLabel("Household name").fill(name);
  await page.getByRole("button", { name: "Create household" }).click();
});

Then("I should be viewing the empty Recipes workspace", async ({ page }) => {
  await expect(page).toHaveURL(/\/recipes$/);
  await expect(page.getByRole("heading", { name: "Recipes" })).toBeVisible();
  await expect(page.getByText("No recipes yet")).toBeVisible();
});

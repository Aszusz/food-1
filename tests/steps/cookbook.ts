import { expect, type Page } from "@playwright/test";
import { createBdd, type DataTable } from "playwright-bdd";

const { When, Then } = createBdd();

When("I create a household named {string}", async ({ page }, name: string) => {
  await page.getByLabel("Household name").fill(name);
  await page
    .getByRole("button", { name: "Create household", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: `Welcome to ${name}`, exact: true }),
  ).toBeVisible();
});

When(
  "I create a recipe named {string} with cooking step {string} and ingredients:",
  async (
    { page },
    recipeName: string,
    cookingStep: string,
    ingredients: DataTable,
  ) => {
    await page.getByRole("button", { name: "New recipe", exact: true }).click();
    await page.getByLabel("Recipe name").fill(recipeName);
    await page
      .getByLabel("Ingredients", { exact: false })
      .fill(ingredientLines(ingredients));
    await page.getByLabel("Cooking steps", { exact: false }).fill(cookingStep);
    await page
      .getByRole("button", { name: "Save recipe", exact: true })
      .click();
    await expect(
      page.getByRole("button", {
        name: `Open ${recipeName}`,
        exact: true,
      }),
    ).toBeVisible();
  },
);

When(
  "I add the ingredients from {string} to the shopping list",
  async ({ page }, recipeName: string) => {
    await page
      .getByRole("button", { name: `Open ${recipeName}`, exact: true })
      .click();
    const recipe = page.getByRole("region", {
      name: recipeName,
      exact: true,
    });
    await recipe
      .getByRole("button", { name: "Add to list", exact: true })
      .click();
    await expect(
      recipe.getByRole("button", { name: "Added to list", exact: true }),
    ).toBeVisible();
    await recipe.getByRole("button", { name: "Close", exact: true }).click();
  },
);

When("I open the shopping list", async ({ page }) => {
  await page.getByRole("button", { name: "Shopping list" }).click();
  await expect(
    page.getByRole("heading", { name: "Shopping list", exact: true }),
  ).toBeVisible();
});

Then(
  "the shopping list should contain ingredients from {string}:",
  async ({ page }, recipeName: string, ingredients: DataTable) => {
    for (const { amount, name } of ingredients.hashes()) {
      const item = shoppingItem(page, name);
      await expect(item).toContainText(amount);
      await expect(item).toContainText(`From ${recipeName}`);
    }
  },
);

When("I check {string}", async ({ page }, name: string) => {
  await page
    .getByRole("button", { name: `Check ${name}`, exact: true })
    .click();
});

Then("{string} should be in the basket", async ({ page }, name: string) => {
  await expect(
    page.getByRole("heading", { name: "In the basket", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: `Uncheck ${name}`, exact: true }),
  ).toBeVisible();
});

function ingredientLines(ingredients: DataTable) {
  return ingredients
    .hashes()
    .map(({ amount, name }) => `${amount} | ${name}`)
    .join("\n");
}

function shoppingItem(page: Page, name: string) {
  return page.getByRole("listitem").filter({
    has: page.getByRole("button", { name: `Check ${name}`, exact: true }),
  });
}

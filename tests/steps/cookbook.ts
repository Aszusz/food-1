import { expect, type Page } from "@playwright/test";
import { createBdd, type DataTable } from "playwright-bdd";

const { When, Then } = createBdd();

When("I create a household named {string}", async ({ page }, name: string) => {
  await page.getByLabel("Nazwa grupy").fill(name);
  await page.getByRole("button", { name: "Utwórz grupę", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: `Witaj w grupie: ${name}`, exact: true }),
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
    await page
      .getByRole("button", { name: "Nowy przepis", exact: true })
      .click();
    await page.getByLabel("Nazwa przepisu").fill(recipeName);
    await page
      .getByLabel("Składniki", { exact: false })
      .fill(ingredientLines(ingredients));
    await page
      .getByLabel("Kroki przygotowania", { exact: false })
      .fill(cookingStep);
    await page
      .getByRole("button", { name: "Zapisz przepis", exact: true })
      .click();
    await expect(
      page.getByRole("button", {
        name: `Otwórz przepis ${recipeName}`,
        exact: true,
      }),
    ).toBeVisible();
  },
);

When(
  "I add the ingredients from {string} to the shopping list",
  async ({ page }, recipeName: string) => {
    await page
      .getByRole("button", {
        name: `Otwórz przepis ${recipeName}`,
        exact: true,
      })
      .click();
    const recipe = page.getByRole("region", {
      name: recipeName,
      exact: true,
    });
    await recipe
      .getByRole("button", { name: "Dodaj do listy", exact: true })
      .click();
    await expect(
      recipe.getByRole("button", { name: "Dodano do listy", exact: true }),
    ).toBeVisible();
    await recipe.getByRole("button", { name: "Zamknij", exact: true }).click();
  },
);

When("I open the shopping list", async ({ page }) => {
  await page.getByRole("button", { name: "Lista zakupów" }).click();
  await expect(
    page.getByRole("heading", { name: "Lista zakupów", exact: true }),
  ).toBeVisible();
});

Then(
  "the shopping list should contain ingredients from {string}:",
  async ({ page }, recipeName: string, ingredients: DataTable) => {
    for (const { amount, name } of ingredients.hashes()) {
      const item = shoppingItem(page, name);
      await expect(item).toContainText(amount);
      await expect(item).toContainText(`Z przepisu ${recipeName}`);
    }
  },
);

When("I check {string}", async ({ page }, name: string) => {
  await page
    .getByRole("button", { name: `Zaznacz ${name}`, exact: true })
    .click();
});

Then("{string} should be in the basket", async ({ page }, name: string) => {
  await expect(
    page.getByRole("heading", { name: "W koszyku", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: `Odznacz ${name}`, exact: true }),
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
    has: page.getByRole("button", { name: `Zaznacz ${name}`, exact: true }),
  });
}

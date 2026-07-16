import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";

const { Given, When, Then } = createBdd();
const recipeAddresses = new WeakMap<import("@playwright/test").Page, string>();
const navigationErrors = new WeakMap<
  import("@playwright/test").Page,
  string[]
>();

When("I select the New Recipe action", async ({ page }) => {
  const errors: string[] = [];
  navigationErrors.set(page, errors);
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await actionControl(page, "New Recipe").click();
});

When("I enter recipe title {string}", async ({ page }, title: string) => {
  await page.getByLabel("Title").fill(title);
});

When(
  "I enter recipe description {string}",
  async ({ page }, description: string) => {
    await page.getByLabel("Description").fill(description);
  },
);

When(
  "I add ingredient {string} with quantity {string} and unit {string}",
  async ({ page }, name: string, quantity: string, unit: string) => {
    await addIngredient(page, { name, quantity, unit });
  },
);

When(
  "I add ingredient {string} with quantity {string} and unit {string} and note {string}",
  async (
    { page },
    name: string,
    quantity: string,
    unit: string,
    note: string,
  ) => {
    await addIngredient(page, { name, quantity, unit, note });
  },
);

When("I remove ingredient {string}", async ({ page }, name: string) => {
  await page.getByRole("button", { name: `Remove ingredient ${name}` }).click();
});

When(
  "I rename ingredient {string} to {string}",
  async ({ page }, name: string, newName: string) => {
    await page.getByRole("button", { name: `Edit ingredient ${name}` }).click();
    const row = page
      .getByLabel("Ingredients")
      .getByRole("row", { name: "Edit ingredient", exact: true })
      .last();
    await row.getByLabel("Name").fill(newName);
    await row.getByRole("button", { name: "Update ingredient" }).click();
  },
);

When("I move ingredient {string} up", async ({ page }, name: string) => {
  await page
    .getByRole("button", { name: `Move ingredient ${name} up` })
    .click();
});

When("I move ingredient {string} down", async ({ page }, name: string) => {
  await page
    .getByRole("button", { name: `Move ingredient ${name} down` })
    .click();
});

When("I add cooking step {string}", async ({ page }, step: string) => {
  await page.getByRole("button", { name: "Add step" }).click();
  const row = page.getByLabel("Steps").getByRole("listitem").last();
  await row.getByRole("textbox").fill(step);
});

When("I move cooking step {string} up", async ({ page }, step: string) => {
  await page.getByRole("button", { name: `Move step ${step} up` }).click();
});

When("I move cooking step {string} down", async ({ page }, step: string) => {
  await page.getByRole("button", { name: `Move step ${step} down` }).click();
});

When("I remove cooking step {string}", async ({ page }, step: string) => {
  await page.getByRole("button", { name: `Remove step ${step}` }).click();
});

When("I save the recipe", async ({ page }) => {
  await page.getByRole("button", { name: "Save recipe" }).click();
});

Given("I have created recipe {string}", async ({ page }, title: string) => {
  await createRecipe(page, title);
});

When(
  "I open recipe {string} from the Recipe List",
  async ({ page }, title: string) => {
    await page.getByRole("link", { name: title, exact: true }).click();
  },
);

When("I select Edit Recipe", async ({ page }) => {
  await actionControl(page, "Edit Recipe").click();
});

When(
  "I change the recipe title to {string}",
  async ({ page }, title: string) => {
    await page.getByLabel("Title").fill(title);
  },
);

When("I return to the Recipe List", async ({ page }) => {
  await page
    .getByLabel("Primary navigation")
    .getByRole("link", { name: "Recipes", exact: true })
    .click();
});

When(
  "I dismiss the confirmation to return to the Recipe List",
  async ({ page }) => {
    let confirmationMessage = "";
    page.once("dialog", async (dialog) => {
      confirmationMessage = dialog.message();
      await dialog.dismiss();
    });
    await page
      .getByLabel("Primary navigation")
      .getByRole("link", { name: "Recipes", exact: true })
      .click();
    await expect
      .poll(() => confirmationMessage)
      .toBe("Discard your unsaved recipe changes?");
  },
);

Given(
  "I record the address for recipe {string}",
  async ({ page }, title: string) => {
    await page.getByRole("link", { name: title, exact: true }).click();
    recipeAddresses.set(page, page.url());
  },
);

When("I visit the recorded recipe address", async ({ page }) => {
  const address = recipeAddresses.get(page);
  if (!address) throw new Error("No recipe address was recorded");
  await page.goto(address);
});

Then("I should be viewing the New Recipe editor", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "New Recipe" })).toBeVisible();
});

Then(
  "the recipe editor should show empty ingredient and step lists",
  async ({ page }) => {
    await expect(
      page.getByLabel("Ingredients").getByRole("row", { name: /^Ingredient / }),
    ).toHaveCount(0);
    await expect(
      page.getByText("Add the ingredients people need to make this recipe."),
    ).toBeVisible();
    await expect(page.getByLabel("Steps").getByRole("listitem")).toHaveCount(0);
    await expect(
      page.getByText("Add the cooking steps in the order they should happen."),
    ).toBeVisible();
  },
);

Then(
  "the recipe editor fields should have visible labels",
  async ({ page }) => {
    for (const label of ["Title", "Description"]) {
      await expect(page.getByLabel(label, { exact: true })).toBeVisible();
    }
  },
);

Then(
  "the recipe editor title should be {string}",
  async ({ page }, title: string) => {
    await expect(page.getByLabel("Title")).toHaveValue(title);
  },
);

Then(
  "the recipe editor should show an empty cooking step list",
  async ({ page }) => {
    await expect(page.getByLabel("Steps").getByRole("listitem")).toHaveCount(0);
    await expect(
      page.getByText("Add the cooking steps in the order they should happen."),
    ).toBeVisible();
  },
);

Then(
  "ingredient names in the recipe editor should appear in this order:",
  async (
    { page },
    dataTable: { hashes: () => Array<Record<string, string>> },
  ) => {
    for (const [index, { name }] of dataTable.hashes().entries()) {
      await expect(
        page
          .getByLabel("Ingredients")
          .getByRole("row", { name: /^Ingredient / })
          .nth(index),
      ).toHaveAccessibleName(`Ingredient ${name}`);
    }
  },
);

Then(
  "cooking steps in the recipe editor should appear in this order:",
  async (
    { page },
    dataTable: { hashes: () => Array<Record<string, string>> },
  ) => {
    for (const [index, { step }] of dataTable.hashes().entries()) {
      await expect(
        page.getByLabel("Steps").getByRole("listitem").nth(index),
      ).toContainText(step);
    }
  },
);

Then(
  "no Hooks error should have occurred during navigation",
  async ({ page }) => {
    await expect(navigationErrors.get(page) ?? []).not.toContain(
      expect.stringContaining("Rendered fewer hooks than expected"),
    );
  },
);

Then(
  "I should be viewing Recipe Detail for {string}",
  async ({ page }, title: string) => {
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
  },
);

Then(
  "Recipe Detail should show recipe {string} with description {string}",
  async ({ page }, title: string, description: string) => {
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
    await expect(page.getByText(description, { exact: true })).toBeVisible();
  },
);

Then(
  "Recipe Detail should show ingredients in this order:",
  async (
    { page },
    dataTable: { hashes: () => Array<Record<string, string>> },
  ) => {
    const ingredients = dataTable.hashes().map(formatIngredient);
    await expect(
      page.getByLabel("Ingredients").getByRole("listitem"),
    ).toHaveText(ingredients);
  },
);

Then(
  "Recipe Detail should show cooking steps in this order:",
  async (
    { page },
    dataTable: { hashes: () => Array<Record<string, string>> },
  ) => {
    const steps = dataTable.hashes().map(({ step }) => step);
    await expect(
      page.getByLabel("Cooking steps").getByRole("listitem"),
    ).toHaveText(steps);
  },
);

Then(
  "I should see recipe {string} in the Recipe List",
  async ({ page }, title: string) => {
    await expect(
      page.getByRole("link", { name: title, exact: true }),
    ).toBeVisible();
  },
);

Then(
  "the recipe editor should be prefilled with recipe {string}",
  async ({ page }, title: string) => {
    await expect(page.getByLabel("Title")).toHaveValue(title);
    await expect(page.getByLabel("Description")).toHaveValue("A warming soup");
  },
);

Then(
  "Recipe Detail should show recipe {string}",
  async ({ page }, title: string) => {
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
  },
);

Then("I should be returned to the Recipe List", async ({ page }) => {
  await expect(page).toHaveURL(/\/recipes$/);
  await expect(page.getByRole("heading", { name: "Recipes" })).toBeVisible();
});

Then(
  "I should not see recipe {string} in the Recipe List",
  async ({ page }, title: string) => {
    await expect(
      page.getByRole("link", { name: title, exact: true }),
    ).toHaveCount(0);
  },
);

async function addIngredient(
  page: import("@playwright/test").Page,
  ingredient: { name: string; quantity: string; unit: string; note?: string },
) {
  const row = page
    .getByLabel("Ingredients")
    .getByRole("row", { name: "New ingredient" });
  await row.getByLabel("Name").fill(ingredient.name);
  await row.getByLabel("Quantity").fill(ingredient.quantity);
  await row.getByLabel("Unit").fill(ingredient.unit);
  if (ingredient.note) await row.getByLabel("Note").fill(ingredient.note);
  await row.getByRole("button", { name: "Add ingredient" }).click();
}

async function createRecipe(
  page: import("@playwright/test").Page,
  title: string,
) {
  await actionControl(page, "New Recipe").click();
  await page.getByLabel("Title").fill(title);
  await page.getByLabel("Description").fill("A warming soup");
  await page.getByRole("button", { name: "Save recipe" }).click();
  await expect(page.getByRole("heading", { name: title })).toBeVisible();
  await page
    .getByLabel("Primary navigation")
    .getByRole("link", { name: "Recipes", exact: true })
    .click();
}

function formatIngredient(ingredient: Record<string, string>) {
  return [
    ingredient.quantity,
    ingredient.unit,
    ingredient.name,
    ingredient.note,
  ]
    .filter(Boolean)
    .join(" ");
}

function actionControl(page: import("@playwright/test").Page, name: string) {
  return page
    .getByRole("link", { name, exact: true })
    .or(page.getByRole("button", { name, exact: true }));
}

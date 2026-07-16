import { resetDatabase } from "@monobara/db";
import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";

const { Given, When, Then } = createBdd();
const password = "password123";

Given("I am viewing the todo app", async ({ page }) => {
  await resetDatabase();
  await signIn(page, "alice@example.com");
  await expect(page.getByRole("heading", { name: "Todos" })).toBeVisible();
});

Given("I have added a todo named {string}", async ({ page }, name: string) => {
  await addTodo(page, name);
});

When("I add a todo named {string}", async ({ page }, name: string) => {
  await addTodo(page, name);
});

When("I delete the todo named {string}", async ({ page }, name: string) => {
  await todo(page, name).getByRole("button", { name: "Delete" }).click();
});

When(
  "I mark the todo named {string} as done",
  async ({ page }, name: string) => {
    await todo(page, name).getByRole("checkbox").click();
  },
);

When("I filter todos by {string}", async ({ page }, filter: string) => {
  await page.getByRole("tab", { name: filter }).click();
});

When("I refresh the page", async ({ page }) => {
  await page.reload();
});

Then("{string} should be the first todo", async ({ page }, name: string) => {
  await expect(page.getByRole("listitem").first()).toContainText(name);
});

Then("I should see a todo named {string}", async ({ page }, name: string) => {
  await expect(todo(page, name)).toBeVisible();
});

Then(
  "I should not see a todo named {string}",
  async ({ page }, name: string) => {
    await expect(todo(page, name)).toHaveCount(0);
  },
);

async function addTodo(page: import("@playwright/test").Page, name: string) {
  await page.getByPlaceholder("Add a todo").fill(name);
  await page.getByRole("button", { name: "Add" }).click();
  await expect(todo(page, name)).toBeVisible();
}

function todo(page: import("@playwright/test").Page, name: string) {
  return page.getByRole("listitem").filter({ hasText: name });
}

async function signIn(page: import("@playwright/test").Page, email: string) {
  await page.request.post(
    `${process.env.BETTER_AUTH_URL}/api/auth/sign-up/email`,
    {
      data: { email, password, name: email },
    },
  );
  await page.context().clearCookies();
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Log in" }).click();
}

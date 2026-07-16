import { resetDatabase } from "@monobara/db";
import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";

const { Given, When, Then } = createBdd();
const password = "password123";

Given("I am signed out", async ({ page }) => {
  await resetDatabase();
  await page.goto("/login");
});

Given("I am signed in as {string}", async ({ page }, email: string) => {
  await resetDatabase();
  await createAccount(page, email);
  await signIn(page, email);
});

Given("I have an account for {string}", async ({ page }, email: string) => {
  await resetDatabase();
  await signUp(page, email);
  await signOut(page);
});

When("I visit the todo app", async ({ page }) => {
  await page.goto("/");
});

When("I visit the login page", async ({ page }) => {
  await page.goto("/login");
});

When("I visit the signup page", async ({ page }) => {
  await page.goto("/signup");
});

When("I visit the protected todos page", async ({ page }) => {
  await page.goto("/todos?filter=all");
});

When("I sign out", async ({ page }) => {
  await signOut(page);
});

When("I sign in as {string}", async ({ page }, email: string) => {
  await createAccount(page, email);
  await signIn(page, email);
});

When("I sign up as {string}", async ({ page }, email: string) => {
  await signUp(page, email);
});

When("I log in as {string}", async ({ page }, email: string) => {
  await signIn(page, email);
});

When(
  "I log in as {string} with password {string}",
  async ({ page }, email: string, password: string) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Log in" }).click();
  },
);

Then("I should be viewing the todo app", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "Todos" })).toBeVisible();
});

Then("I should be viewing the login page", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "Log in" })).toBeVisible();
});

Then("I should see an invalid credentials message", async ({ page }) => {
  await expect(page.getByText("Invalid credentials")).toBeVisible();
});

async function signIn(page: import("@playwright/test").Page, email: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page.getByRole("heading", { name: "Todos" })).toBeVisible();
}

async function signUp(page: import("@playwright/test").Page, email: string) {
  await page.goto("/signup");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign up" }).click();
  await expect(page.getByRole("heading", { name: "Todos" })).toBeVisible();
}

async function signOut(page: import("@playwright/test").Page) {
  await page.getByRole("button", { name: "Account menu" }).click();
  await page.getByRole("menuitem", { name: "Sign out" }).click();
  await expect(page.getByRole("heading", { name: "Log in" })).toBeVisible();
}

async function createAccount(
  page: import("@playwright/test").Page,
  email: string,
) {
  await page.request.post(
    `${process.env.BETTER_AUTH_URL}/api/auth/sign-up/email`,
    {
      data: { email, password, name: email },
    },
  );
  await page.context().clearCookies();
}

import { resetDatabase } from "@monobara/db";
import { expect, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";

const { Given, When, Then } = createBdd();
const password = "password123";

Given("I am signed out", async ({ page }) => {
  await resetDatabase();
  await page.goto("/login");
});

Given("the signup endpoint is unavailable", async ({ page }) => {
  await page.route("**/api/auth/sign-up/email", (route) => route.abort());
});

Given("I have an account for {string}", async ({ page }, email: string) => {
  await resetDatabase();
  await createAccount(page, email);
});

When("I visit the protected cookbook", async ({ page }) => {
  await page.goto("/app");
});

When("I sign in as {string}", async ({ page }, email: string) => {
  await signIn(page, email);
});

When(
  "I sign up as {string} named {string}",
  async ({ page }, email: string, name: string) => {
    await page.goto("/signup");
    await page.getByLabel("Imię").fill(name);
    await page.getByLabel("Adres e-mail").fill(email);
    await page.getByLabel("Hasło").fill(password);
    await page
      .getByRole("button", { name: "Utwórz konto", exact: true })
      .click();
  },
);

When(
  "I sign in as {string} with password {string}",
  async ({ page }, email: string, password: string) => {
    await page.goto("/login");
    await page.getByLabel("Adres e-mail").fill(email);
    await page.getByLabel("Hasło").fill(password);
    await page
      .getByRole("button", { name: "Zaloguj się", exact: true })
      .click();
  },
);

Then("I should be ready to create a household", async ({ page }) => {
  await expect(
    page.getByRole("heading", { name: "Nazwij swoją grupę", exact: true }),
  ).toBeVisible();
});

Then("I should be viewing the sign-in page", async ({ page }) => {
  await expect(
    page.getByRole("heading", { name: "Zapraszamy do stołu", exact: true }),
  ).toBeVisible();
});

Then("I should see an invalid credentials message", async ({ page }) => {
  await expect(
    page.getByText("Nieprawidłowy adres e-mail lub hasło.", { exact: true }),
  ).toBeVisible();
});

Then(
  "I should see the signup error {string}",
  async ({ page }, message: string) => {
    await expect(page.getByText(message, { exact: true })).toBeVisible();
  },
);

Then("the Create account button should be enabled", async ({ page }) => {
  await expect(
    page.getByRole("button", { name: "Utwórz konto", exact: true }),
  ).toBeEnabled();
});

async function signIn(page: Page, email: string) {
  await page.goto("/login");
  await page.getByLabel("Adres e-mail").fill(email);
  await page.getByLabel("Hasło").fill(password);
  await page.getByRole("button", { name: "Zaloguj się", exact: true }).click();
}

async function createAccount(page: Page, email: string) {
  await page.request.post(
    `${process.env.BETTER_AUTH_URL}/api/auth/sign-up/email`,
    {
      data: { email, password, name: email },
    },
  );
  await page.context().clearCookies();
}

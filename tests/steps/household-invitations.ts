import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";

const { When, Then } = createBdd();
const invitations = new WeakMap<import("@playwright/test").Page, string>();

When("I open Household Settings", async ({ page }) => {
  await page.goto("/settings");
  await page.getByRole("link", { name: "Household", exact: true }).click();
  await expect(page).toHaveURL(/\/settings\/household$/);
});

When("I create a household invitation", async ({ page }) => {
  await createInvitation(page);
});

When("I open the household invitation while signed out", async ({ page }) => {
  await page.getByRole("button", { name: "Account menu" }).click();
  await page.getByRole("menuitem", { name: "Sign out" }).click();
  await page.waitForURL("/login");
  await openInvitation(page);
  await page.waitForURL(/\/signup\?returnTo=/);
});

When("I open the household invitation", async ({ page }) => {
  await openInvitation(page);
});

When(
  "I sign up as {string} to accept the invitation",
  async ({ page }, email: string) => {
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill("password123");
    await page.getByRole("button", { name: "Sign up" }).click();
  },
);

When("I leave the household", async ({ page }) => {
  await page.getByRole("button", { name: "Leave household" }).click();
});

Then(
  "I should see household member {string}",
  async ({ page }, email: string) => {
    await expect(page.getByText(email, { exact: true })).toBeVisible();
  },
);

Then("I should see a copyable invite link", async ({ page }) => {
  await expect(
    page.getByRole("dialog", { name: "Invite member" }),
  ).toBeVisible();
  await expect(page.getByLabel("Invite link")).toHaveValue(/.+/);
  await expect(page.getByRole("button", { name: "Copy link" })).toBeVisible();
});

Then("I should see an invitation acceptance error", async ({ page }) => {
  await expect(
    page.getByText("This invitation can't be accepted.", { exact: true }),
  ).toBeVisible();
});

async function createInvitation(page: import("@playwright/test").Page) {
  await page.getByRole("button", { name: "Invite member" }).click();
  const link = page.getByLabel("Invite link");
  await expect(link).toHaveValue(/.+/);
  invitations.set(page, await link.inputValue());
}

async function openInvitation(page: import("@playwright/test").Page) {
  const invitation = invitations.get(page);
  if (!invitation) throw new Error("No household invitation was created");
  await page.goto(invitation).catch((error: unknown) => {
    if (!String(error).includes("ERR_ABORTED")) throw error;
  });
}

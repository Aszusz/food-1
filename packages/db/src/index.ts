import { db } from "./client";
import { account, session, user, verification } from "./schema/auth";
import {
  householdMembers,
  households,
  recipes,
  shoppingItems,
} from "./schema/cookbook";

export { db } from "./client";
export * from "./cookbook";
export * as schema from "./schema";

export async function resetDatabase() {
  await db.delete(shoppingItems);
  await db.delete(recipes);
  await db.delete(householdMembers);
  await db.delete(households);
  await db.delete(session);
  await db.delete(account);
  await db.delete(verification);
  await db.delete(user);
}

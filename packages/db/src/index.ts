import { db } from "./client";
import { account, session, user, verification } from "./schema/auth";
import {
  household,
  householdInvite,
  householdMember,
} from "./schema/household";

export { db } from "./client";
export * from "./household";
export * as schema from "./schema";

export async function resetDatabase() {
  await db.delete(householdInvite);
  await db.delete(householdMember);
  await db.delete(household);
  await db.delete(session);
  await db.delete(account);
  await db.delete(verification);
  await db.delete(user);
}

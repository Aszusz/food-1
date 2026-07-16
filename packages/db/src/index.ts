import { db } from "./client";
import { account, session, user, verification } from "./schema/auth";
import { todos } from "./schema/todos";

export { db } from "./client";
export * as schema from "./schema";
export * from "./todos";

export async function resetDatabase() {
  await db.delete(todos);
  await db.delete(session);
  await db.delete(account);
  await db.delete(verification);
  await db.delete(user);
}

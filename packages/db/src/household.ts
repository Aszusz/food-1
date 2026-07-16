import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "./client";
import { household, householdMember } from "./schema/household";

export async function getHousehold(userId: string) {
  const [result] = await db
    .select({ id: household.id, name: household.name })
    .from(householdMember)
    .innerJoin(household, eq(householdMember.householdId, household.id))
    .where(eq(householdMember.userId, userId));

  return result ?? null;
}

export async function createHousehold(userId: string, name: string) {
  return db.transaction(async (tx) => {
    const id = randomUUID();
    await tx.insert(household).values({ id, name });
    await tx.insert(householdMember).values({
      id: randomUUID(),
      householdId: id,
      userId,
    });
    return { id, name };
  });
}

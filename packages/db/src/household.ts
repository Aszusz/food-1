import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "./client";
import { user } from "./schema/auth";
import {
  household,
  householdInvite,
  householdMember,
} from "./schema/household";

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

export async function getMembers(householdId: string) {
  return db
    .select({ id: user.id, email: user.email })
    .from(householdMember)
    .innerJoin(user, eq(householdMember.userId, user.id))
    .where(eq(householdMember.householdId, householdId));
}

export async function createInvite(householdId: string) {
  const token = randomUUID();
  await db.insert(householdInvite).values({
    id: randomUUID(),
    householdId,
    token,
  });
  return { token };
}

export async function getInvite(token: string) {
  const [result] = await db
    .select({ householdId: household.id, householdName: household.name })
    .from(householdInvite)
    .innerJoin(household, eq(householdInvite.householdId, household.id))
    .where(eq(householdInvite.token, token));
  return result ?? null;
}

export async function acceptInvite(userId: string, token: string) {
  const invite = await getInvite(token);
  if (!invite) return null;
  await db
    .insert(householdMember)
    .values({
      id: randomUUID(),
      householdId: invite.householdId,
      userId,
    })
    .onConflictDoNothing({ target: householdMember.userId });
  const household = await getHousehold(userId);
  return household?.id === invite.householdId ? household : null;
}

export async function leaveHousehold(userId: string) {
  await db.delete(householdMember).where(eq(householdMember.userId, userId));
}

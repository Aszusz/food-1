import { randomBytes, randomUUID } from "node:crypto";
import type { Ingredient, Overview } from "@monobara/contract";
import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { db } from "./client";
import { user } from "./schema/auth";
import {
  householdMembers,
  households,
  recipes,
  shoppingItems,
} from "./schema/cookbook";

type RecipeInput = {
  id?: string;
  title: string;
  description: string;
  prepMinutes: number;
  cookMinutes: number;
  servings: number;
  ingredients: Ingredient[];
  steps: string[];
};

export async function getOverview(userId: string): Promise<Overview> {
  const [membership] = await db
    .select({ householdId: householdMembers.householdId })
    .from(householdMembers)
    .where(eq(householdMembers.userId, userId));

  if (!membership) {
    return { household: null, recipes: [], shoppingItems: [] };
  }

  const householdId = membership.householdId;
  const [household, members, recipeList, itemList] = await Promise.all([
    db
      .select({
        id: households.id,
        name: households.name,
        inviteCode: households.inviteCode,
      })
      .from(households)
      .where(eq(households.id, householdId))
      .then((rows) => rows[0]),
    db
      .select({ id: user.id, name: user.name, email: user.email })
      .from(householdMembers)
      .innerJoin(user, eq(householdMembers.userId, user.id))
      .where(eq(householdMembers.householdId, householdId))
      .orderBy(asc(householdMembers.createdAt)),
    db
      .select(recipeColumns)
      .from(recipes)
      .where(eq(recipes.householdId, householdId))
      .orderBy(desc(recipes.createdAt)),
    db
      .select(shoppingColumns)
      .from(shoppingItems)
      .where(eq(shoppingItems.householdId, householdId))
      .orderBy(asc(shoppingItems.done), desc(shoppingItems.createdAt)),
  ]);

  if (!household) return { household: null, recipes: [], shoppingItems: [] };
  return {
    household: { ...household, members },
    recipes: recipeList,
    shoppingItems: itemList,
  };
}

export async function createHousehold(userId: string, name: string) {
  if (await householdIdFor(userId))
    throw new Error("Account already belongs to a household");
  const householdId = randomUUID();
  await db.transaction(async (tx) => {
    await tx.insert(households).values({
      id: householdId,
      name,
      inviteCode: randomBytes(4).toString("hex").toUpperCase(),
    });
    await tx.insert(householdMembers).values({
      id: randomUUID(),
      householdId,
      userId,
    });
  });
  return getOverview(userId);
}

export async function joinHousehold(userId: string, inviteCode: string) {
  if (await householdIdFor(userId))
    throw new Error("Account already belongs to a household");
  const [household] = await db
    .select({ id: households.id })
    .from(households)
    .where(eq(households.inviteCode, inviteCode.toUpperCase()));
  if (!household) throw new Error("Invite code not found");
  await db.insert(householdMembers).values({
    id: randomUUID(),
    householdId: household.id,
    userId,
  });
  return getOverview(userId);
}

export async function saveRecipe(userId: string, input: RecipeInput) {
  const householdId = await requireHousehold(userId);
  if (input.id) {
    await db
      .update(recipes)
      .set({ ...input, updatedAt: new Date() })
      .where(
        and(eq(recipes.id, input.id), eq(recipes.householdId, householdId)),
      );
  } else {
    await db.insert(recipes).values({
      ...input,
      id: randomUUID(),
      householdId,
      createdBy: userId,
    });
  }
  return getOverview(userId);
}

export async function deleteRecipe(userId: string, id: string) {
  const householdId = await requireHousehold(userId);
  await db
    .delete(recipes)
    .where(and(eq(recipes.id, id), eq(recipes.householdId, householdId)));
  return getOverview(userId);
}

export async function toggleFavorite(userId: string, id: string) {
  const householdId = await requireHousehold(userId);
  const [recipe] = await db
    .select({ favorite: recipes.favorite })
    .from(recipes)
    .where(and(eq(recipes.id, id), eq(recipes.householdId, householdId)));
  if (recipe) {
    await db
      .update(recipes)
      .set({ favorite: !recipe.favorite })
      .where(and(eq(recipes.id, id), eq(recipes.householdId, householdId)));
  }
  return getOverview(userId);
}

export async function addRecipeToList(userId: string, id: string) {
  const householdId = await requireHousehold(userId);
  const [recipe] = await db
    .select({ title: recipes.title, ingredients: recipes.ingredients })
    .from(recipes)
    .where(and(eq(recipes.id, id), eq(recipes.householdId, householdId)));
  if (!recipe) return getOverview(userId);

  const existing = await db
    .select()
    .from(shoppingItems)
    .where(eq(shoppingItems.householdId, householdId));
  const ingredients = [
    ...recipe.ingredients
      .reduce((byName, ingredient) => {
        const key = ingredient.name.trim().toLowerCase();
        const current = byName.get(key);
        byName.set(key, {
          ...ingredient,
          amount: current
            ? combineAmounts(current.amount, ingredient.amount)
            : ingredient.amount,
        });
        return byName;
      }, new Map<string, Ingredient>())
      .values(),
  ];
  await db.transaction(async (tx) => {
    for (const ingredient of ingredients) {
      const match = existing.find(
        (item) =>
          item.name.trim().toLowerCase() ===
          ingredient.name.trim().toLowerCase(),
      );
      if (match) {
        await tx
          .update(shoppingItems)
          .set({
            amount: combineAmounts(match.amount, ingredient.amount),
            done: false,
            source: recipe.title,
          })
          .where(eq(shoppingItems.id, match.id));
      } else {
        await tx.insert(shoppingItems).values({
          id: randomUUID(),
          householdId,
          name: ingredient.name,
          amount: ingredient.amount,
          source: recipe.title,
        });
      }
    }
  });
  return getOverview(userId);
}

export async function addShoppingItem(
  userId: string,
  name: string,
  amount: string,
) {
  const householdId = await requireHousehold(userId);
  const items = await db
    .select()
    .from(shoppingItems)
    .where(eq(shoppingItems.householdId, householdId));
  const existing = items.find(
    (item) => item.name.trim().toLowerCase() === name.trim().toLowerCase(),
  );
  if (existing) {
    await db
      .update(shoppingItems)
      .set({ amount: amount || existing.amount, done: false })
      .where(eq(shoppingItems.id, existing.id));
  } else {
    await db.insert(shoppingItems).values({
      id: randomUUID(),
      householdId,
      name,
      amount,
    });
  }
  return getOverview(userId);
}

export async function toggleShoppingItem(userId: string, id: string) {
  const householdId = await requireHousehold(userId);
  const [item] = await db
    .select({ done: shoppingItems.done })
    .from(shoppingItems)
    .where(
      and(eq(shoppingItems.id, id), eq(shoppingItems.householdId, householdId)),
    );
  if (item) {
    await db
      .update(shoppingItems)
      .set({ done: !item.done })
      .where(
        and(
          eq(shoppingItems.id, id),
          eq(shoppingItems.householdId, householdId),
        ),
      );
  }
  return getOverview(userId);
}

export async function deleteShoppingItem(userId: string, id: string) {
  const householdId = await requireHousehold(userId);
  await db
    .delete(shoppingItems)
    .where(
      and(eq(shoppingItems.id, id), eq(shoppingItems.householdId, householdId)),
    );
  return getOverview(userId);
}

export async function clearPurchased(userId: string) {
  const householdId = await requireHousehold(userId);
  const purchased = await db
    .select({ id: shoppingItems.id })
    .from(shoppingItems)
    .where(
      and(
        eq(shoppingItems.householdId, householdId),
        eq(shoppingItems.done, true),
      ),
    );
  if (purchased.length) {
    await db.delete(shoppingItems).where(
      inArray(
        shoppingItems.id,
        purchased.map(({ id }) => id),
      ),
    );
  }
  return getOverview(userId);
}

async function householdIdFor(userId: string) {
  const [membership] = await db
    .select({ householdId: householdMembers.householdId })
    .from(householdMembers)
    .where(eq(householdMembers.userId, userId));
  return membership?.householdId;
}

async function requireHousehold(userId: string) {
  const householdId = await householdIdFor(userId);
  if (!householdId) throw new Error("Create or join a household first");
  return householdId;
}

function combineAmounts(first: string, second: string) {
  return [...new Set([first, second].filter(Boolean))].join(" + ");
}

const recipeColumns = {
  id: recipes.id,
  title: recipes.title,
  description: recipes.description,
  prepMinutes: recipes.prepMinutes,
  cookMinutes: recipes.cookMinutes,
  servings: recipes.servings,
  favorite: recipes.favorite,
  ingredients: recipes.ingredients,
  steps: recipes.steps,
  createdBy: recipes.createdBy,
};

const shoppingColumns = {
  id: shoppingItems.id,
  name: shoppingItems.name,
  amount: shoppingItems.amount,
  done: shoppingItems.done,
  source: shoppingItems.source,
};

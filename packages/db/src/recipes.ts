import { randomUUID } from "node:crypto";
import { and, asc, eq } from "drizzle-orm";
import { db } from "./client";
import { recipe, recipeIngredient, recipeStep } from "./schema/recipe";

export type RecipeInput = {
  title: string;
  description: string;
  ingredients: Array<{
    name: string;
    quantity: string;
    unit: string;
    note: string;
  }>;
  steps: Array<{ text: string }>;
};

export async function listRecipes(householdId: string) {
  return db
    .select({ id: recipe.id, title: recipe.title })
    .from(recipe)
    .where(eq(recipe.householdId, householdId))
    .orderBy(asc(recipe.createdAt));
}

export async function getRecipe(householdId: string, id: string) {
  const [result] = await db
    .select({
      id: recipe.id,
      title: recipe.title,
      description: recipe.description,
    })
    .from(recipe)
    .where(and(eq(recipe.id, id), eq(recipe.householdId, householdId)));
  if (!result) return null;

  const [ingredients, steps] = await Promise.all([
    db
      .select({
        name: recipeIngredient.name,
        quantity: recipeIngredient.quantity,
        unit: recipeIngredient.unit,
        note: recipeIngredient.note,
      })
      .from(recipeIngredient)
      .where(eq(recipeIngredient.recipeId, id))
      .orderBy(asc(recipeIngredient.position)),
    db
      .select({ text: recipeStep.text })
      .from(recipeStep)
      .where(eq(recipeStep.recipeId, id))
      .orderBy(asc(recipeStep.position)),
  ]);

  return { ...result, ingredients, steps };
}

export async function createRecipe(householdId: string, input: RecipeInput) {
  const id = randomUUID();
  await db.transaction(async (tx) => {
    await tx.insert(recipe).values({
      id,
      householdId,
      title: input.title,
      description: input.description,
    });
    await replaceRecipeContents(tx, id, input);
  });
  return getRecipe(householdId, id);
}

export async function updateRecipe(
  householdId: string,
  id: string,
  input: RecipeInput,
) {
  return db.transaction(async (tx) => {
    const [updated] = await tx
      .update(recipe)
      .set({ title: input.title, description: input.description })
      .where(and(eq(recipe.id, id), eq(recipe.householdId, householdId)))
      .returning({ id: recipe.id });
    if (!updated) return null;
    await tx.delete(recipeIngredient).where(eq(recipeIngredient.recipeId, id));
    await tx.delete(recipeStep).where(eq(recipeStep.recipeId, id));
    await replaceRecipeContents(tx, id, input);
    return getRecipe(householdId, id);
  });
}

async function replaceRecipeContents(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  recipeId: string,
  input: RecipeInput,
) {
  if (input.ingredients.length) {
    await tx.insert(recipeIngredient).values(
      input.ingredients.map((ingredient, position) => ({
        id: randomUUID(),
        recipeId,
        ...ingredient,
        position,
      })),
    );
  }
  if (input.steps.length) {
    await tx.insert(recipeStep).values(
      input.steps.map((step, position) => ({
        id: randomUUID(),
        recipeId,
        ...step,
        position,
      })),
    );
  }
}

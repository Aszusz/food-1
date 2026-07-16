import { oc } from "@orpc/contract";
import { z } from "zod";

export const ingredientSchema = z.object({
  name: z.string().trim().min(1),
  amount: z.string().trim(),
});

export const recipeSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  prepMinutes: z.number().int(),
  cookMinutes: z.number().int(),
  servings: z.number().int(),
  favorite: z.boolean(),
  ingredients: z.array(ingredientSchema),
  steps: z.array(z.string()),
  createdBy: z.string(),
});

export const shoppingItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  amount: z.string(),
  done: z.boolean(),
  source: z.string().nullable(),
});

export const householdSchema = z.object({
  id: z.string(),
  name: z.string(),
  inviteCode: z.string(),
  members: z.array(
    z.object({ id: z.string(), name: z.string(), email: z.string() }),
  ),
});

export const overviewSchema = z.object({
  household: householdSchema.nullable(),
  recipes: z.array(recipeSchema),
  shoppingItems: z.array(shoppingItemSchema),
});

export type Ingredient = z.infer<typeof ingredientSchema>;
export type Recipe = z.infer<typeof recipeSchema>;
export type ShoppingItem = z.infer<typeof shoppingItemSchema>;
export type Household = z.infer<typeof householdSchema>;
export type Overview = z.infer<typeof overviewSchema>;

const recipeInput = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(1),
  description: z.string().trim(),
  prepMinutes: z.number().int().min(0).max(1440),
  cookMinutes: z.number().int().min(0).max(1440),
  servings: z.number().int().min(1).max(100),
  ingredients: z.array(ingredientSchema).min(1),
  steps: z.array(z.string().trim().min(1)).min(1),
});

const idInput = z.object({ id: z.string() });

export const cookbookContract = {
  overview: oc.output(overviewSchema),
  createHousehold: oc
    .input(z.object({ name: z.string().trim().min(1).max(80) }))
    .output(overviewSchema),
  joinHousehold: oc
    .input(z.object({ inviteCode: z.string().trim().min(1).max(12) }))
    .output(overviewSchema),
  saveRecipe: oc.input(recipeInput).output(overviewSchema),
  deleteRecipe: oc.input(idInput).output(overviewSchema),
  toggleFavorite: oc.input(idInput).output(overviewSchema),
  addRecipeToList: oc.input(idInput).output(overviewSchema),
  addShoppingItem: oc
    .input(
      z.object({
        name: z.string().trim().min(1),
        amount: z.string().trim().default(""),
      }),
    )
    .output(overviewSchema),
  toggleShoppingItem: oc.input(idInput).output(overviewSchema),
  deleteShoppingItem: oc.input(idInput).output(overviewSchema),
  clearPurchased: oc.output(overviewSchema),
};

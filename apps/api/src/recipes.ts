import {
  createRecipe,
  getHousehold,
  getRecipe,
  listRecipes,
  updateRecipe,
} from "@monobara/db";
import { ORPCError } from "@orpc/server";
import { os, userId } from "./orpc";

export const recipesRouter = {
  list: os.recipes.list.handler(async ({ context }) => {
    const household = await requireHousehold(userId(context));
    return listRecipes(household.id);
  }),
  get: os.recipes.get.handler(async ({ context, input }) => {
    const household = await requireHousehold(userId(context));
    const recipe = await getRecipe(household.id, input.id);
    if (!recipe) throw new ORPCError("NOT_FOUND");
    return recipe;
  }),
  create: os.recipes.create.handler(async ({ context, input }) => {
    const household = await requireHousehold(userId(context));
    const recipe = await createRecipe(household.id, input);
    if (!recipe) throw new ORPCError("INTERNAL_SERVER_ERROR");
    return recipe;
  }),
  update: os.recipes.update.handler(async ({ context, input }) => {
    const household = await requireHousehold(userId(context));
    const recipe = await updateRecipe(household.id, input.id, input);
    if (!recipe) throw new ORPCError("NOT_FOUND");
    return recipe;
  }),
};

async function requireHousehold(id: string) {
  const household = await getHousehold(id);
  if (!household) throw new ORPCError("FORBIDDEN");
  return household;
}

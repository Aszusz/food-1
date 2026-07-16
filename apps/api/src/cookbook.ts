import {
  addRecipeToList,
  addShoppingItem,
  clearPurchased,
  createHousehold,
  deleteRecipe,
  deleteShoppingItem,
  getOverview,
  joinHousehold,
  saveRecipe,
  toggleFavorite,
  toggleShoppingItem,
} from "@monobara/db";
import { os, userId } from "./orpc";

export const cookbookRouter = {
  overview: os.cookbook.overview.handler(({ context }) =>
    getOverview(userId(context)),
  ),
  createHousehold: os.cookbook.createHousehold.handler(({ context, input }) =>
    createHousehold(userId(context), input.name),
  ),
  joinHousehold: os.cookbook.joinHousehold.handler(({ context, input }) =>
    joinHousehold(userId(context), input.inviteCode),
  ),
  saveRecipe: os.cookbook.saveRecipe.handler(({ context, input }) =>
    saveRecipe(userId(context), input),
  ),
  deleteRecipe: os.cookbook.deleteRecipe.handler(({ context, input }) =>
    deleteRecipe(userId(context), input.id),
  ),
  toggleFavorite: os.cookbook.toggleFavorite.handler(({ context, input }) =>
    toggleFavorite(userId(context), input.id),
  ),
  addRecipeToList: os.cookbook.addRecipeToList.handler(({ context, input }) =>
    addRecipeToList(userId(context), input.id),
  ),
  addShoppingItem: os.cookbook.addShoppingItem.handler(({ context, input }) =>
    addShoppingItem(userId(context), input.name, input.amount),
  ),
  toggleShoppingItem: os.cookbook.toggleShoppingItem.handler(
    ({ context, input }) => toggleShoppingItem(userId(context), input.id),
  ),
  deleteShoppingItem: os.cookbook.deleteShoppingItem.handler(
    ({ context, input }) => deleteShoppingItem(userId(context), input.id),
  ),
  clearPurchased: os.cookbook.clearPurchased.handler(({ context }) =>
    clearPurchased(userId(context)),
  ),
};

import { householdRouter } from "./household";
import { os } from "./orpc";
import { recipesRouter } from "./recipes";

export const router = os.router({
  household: householdRouter,
  recipes: recipesRouter,
});

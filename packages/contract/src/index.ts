import { householdContract } from "./household";
import { recipesContract } from "./recipes";

export const contract = {
  household: householdContract,
  recipes: recipesContract,
};

export type AppRouter = typeof contract;

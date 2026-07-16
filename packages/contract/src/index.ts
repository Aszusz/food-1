import { cookbookContract } from "./cookbook";

export type {
  Household,
  Ingredient,
  Overview,
  Recipe,
  ShoppingItem,
} from "./cookbook";

export const contract = {
  cookbook: cookbookContract,
};

export type AppRouter = typeof contract;

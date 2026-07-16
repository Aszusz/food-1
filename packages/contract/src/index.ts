import { todosContract } from "./todos";

export type { Todo } from "./todos";

export const contract = {
  todos: todosContract,
};

export type AppRouter = typeof contract;

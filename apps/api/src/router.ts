import { os } from "./orpc";
import { todosRouter } from "./todos";

export const router = os.router({
  todos: todosRouter,
});

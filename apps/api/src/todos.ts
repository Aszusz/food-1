import type { Todo } from "@monobara/contract";
import { addTodo, deleteTodo, listTodos, toggleTodo } from "@monobara/db";
import { os, userId } from "./orpc";

export const todosRouter = {
  list: os.todos.list.handler(
    ({ context }): Promise<Todo[]> => listTodos(userId(context)),
  ),
  add: os.todos.add.handler(({ context, input }) =>
    addTodo(userId(context), input.text),
  ),
  toggle: os.todos.toggle.handler(({ context, input }) =>
    toggleTodo(userId(context), input.id),
  ),
  delete: os.todos.delete.handler(({ context, input }) =>
    deleteTodo(userId(context), input.id),
  ),
};

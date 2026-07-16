import type { Todo } from "@monobara/contract";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "../orpc";
import type { TodoFilter } from "./TodoPage";

const todosQueryKey = ["todos"] as const;

export function useTodos() {
  const queryClient = useQueryClient();
  const { data: todos = [] } = useQuery({
    queryKey: todosQueryKey,
    queryFn: () => orpc.todos.list(),
  });

  function setTodos(todos: Todo[]) {
    queryClient.setQueryData(todosQueryKey, todos);
  }

  const addTodoMutation = useMutation({
    mutationFn: (text: string) => orpc.todos.add({ text }),
    onSuccess: setTodos,
  });

  const toggleTodoMutation = useMutation({
    mutationFn: (id: string) => orpc.todos.toggle({ id }),
    onSuccess: setTodos,
  });

  const deleteTodoMutation = useMutation({
    mutationFn: (id: string) => orpc.todos.delete({ id }),
    onSuccess: setTodos,
  });

  function todoIds(filter: TodoFilter) {
    return todos
      .filter((todo) => {
        if (filter === "active") return !todo.done;
        if (filter === "done") return todo.done;
        return true;
      })
      .map((todo) => todo.id);
  }

  async function addTodo(text: string) {
    await addTodoMutation.mutateAsync(text);
  }

  async function toggleTodo(id: string) {
    await toggleTodoMutation.mutateAsync(id);
  }

  async function deleteTodo(id: string) {
    await deleteTodoMutation.mutateAsync(id);
  }

  return { todos, todoIds, addTodo, toggleTodo, deleteTodo };
}

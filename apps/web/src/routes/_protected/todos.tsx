import { createFileRoute } from "@tanstack/react-router";
import {
  type TodoFilter,
  TodoPage,
  todoFilters,
} from "../../features/TodoPage";

export const Route = createFileRoute("/_protected/todos")({
  validateSearch: (search: Record<string, unknown>) => ({
    filter: todoFilters.includes(search.filter as TodoFilter)
      ? (search.filter as TodoFilter)
      : "all",
  }),
  component: TodosRoute,
});

function TodosRoute() {
  const { filter } = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <TodoPage
      filter={filter}
      setFilter={(filter) => void navigate({ search: { filter } })}
    />
  );
}

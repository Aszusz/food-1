import type { ComponentProps } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TodoItem } from "./TodoItem";
import { useTodos } from "./useTodos";

export type TodoFilter = "all" | "active" | "done";

export const todoFilters: TodoFilter[] = ["all", "active", "done"];

export function TodoPage({ filter, setFilter }: TodoPageProps) {
  const [text, setText] = useState("");
  const todos = useTodos();
  const visibleTodoIds = todos.todoIds(filter);

  const submit: NonNullable<ComponentProps<"form">["onSubmit"]> = async (
    event,
  ) => {
    event.preventDefault();
    const nextText = text.trim();
    if (!nextText) return;
    await todos.addTodo(nextText);
    setText("");
  };

  return (
    <main className="min-h-screen px-4 py-10">
      <Card className="mx-auto max-w-xl rounded-3xl border-white/10 bg-card shadow-2xl">
        <CardHeader>
          <CardTitle className="text-3xl tracking-tight">Todos</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={submit} className="flex gap-2">
            <Input
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Add a todo"
              className="h-12 rounded-xl bg-muted px-4"
            />
            <Button type="submit" className="h-12 rounded-xl px-5">
              Add
            </Button>
          </form>

          <Tabs
            value={filter}
            onValueChange={(value) => setFilter(value as TodoFilter)}
            className="mt-10"
          >
            <TabsList>
              {todoFilters.map((name) => (
                <TabsTrigger key={name} value={name} className="capitalize">
                  {name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <ul className="mt-2 divide-y">
            {visibleTodoIds.map((id) => (
              <TodoItem key={id} id={id} todos={todos} />
            ))}
          </ul>

          {visibleTodoIds.length === 0 && (
            <Empty className="mt-6 rounded-2xl">No todos here.</Empty>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

type TodoPageProps = {
  filter: TodoFilter;
  setFilter: (filter: TodoFilter) => void;
};

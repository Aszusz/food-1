import { randomUUID } from "node:crypto";
import type { Todo } from "@monobara/contract";
import { and, desc, eq } from "drizzle-orm";
import { db } from "./client";
import { todos } from "./schema/todos";

export async function listTodos(userId: string): Promise<Todo[]> {
  return db
    .select(todoColumns)
    .from(todos)
    .where(eq(todos.userId, userId))
    .orderBy(desc(todos.createdAt));
}

export async function addTodo(userId: string, text: string): Promise<Todo[]> {
  await db.insert(todos).values({
    id: randomUUID(),
    userId,
    text,
  });

  return listTodos(userId);
}

export async function toggleTodo(userId: string, id: string): Promise<Todo[]> {
  const [todo] = await db
    .select({ done: todos.done })
    .from(todos)
    .where(and(eq(todos.id, id), eq(todos.userId, userId)));

  if (todo) {
    await db
      .update(todos)
      .set({ done: !todo.done })
      .where(and(eq(todos.id, id), eq(todos.userId, userId)));
  }

  return listTodos(userId);
}

export async function deleteTodo(userId: string, id: string): Promise<Todo[]> {
  await db.delete(todos).where(and(eq(todos.id, id), eq(todos.userId, userId)));
  return listTodos(userId);
}

const todoColumns = {
  id: todos.id,
  text: todos.text,
  done: todos.done,
};

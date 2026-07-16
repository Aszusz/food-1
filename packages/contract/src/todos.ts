import { oc } from "@orpc/contract";
import { z } from "zod";

export const todoSchema = z.object({
  id: z.string(),
  text: z.string(),
  done: z.boolean(),
});

export type Todo = z.infer<typeof todoSchema>;

const todoListSchema = z.array(todoSchema);
const todoIdSchema = z.object({ id: z.string() });

export const todosContract = {
  list: oc.output(todoListSchema),
  add: oc
    .input(z.object({ text: z.string().trim().min(1) }))
    .output(todoListSchema),
  toggle: oc.input(todoIdSchema).output(todoListSchema),
  delete: oc.input(todoIdSchema).output(todoListSchema),
};

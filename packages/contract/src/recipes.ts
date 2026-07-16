import { oc } from "@orpc/contract";
import { z } from "zod";

const ingredientSchema = z.object({
  name: z.string().trim().min(1),
  quantity: z.string().trim().min(1),
  unit: z.string().trim().min(1),
  note: z.string().trim(),
});
const stepSchema = z.object({ text: z.string().trim().min(1) });
const recipeInputSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim(),
  ingredients: z.array(ingredientSchema),
  steps: z.array(stepSchema),
});
const recipeSchema = z.object({
  id: z.string(),
  ...recipeInputSchema.shape,
});

export const recipesContract = {
  list: oc.output(z.array(z.object({ id: z.string(), title: z.string() }))),
  get: oc.input(z.object({ id: z.string().uuid() })).output(recipeSchema),
  create: oc.input(recipeInputSchema).output(recipeSchema),
  update: oc
    .input(z.object({ id: z.string().uuid(), ...recipeInputSchema.shape }))
    .output(recipeSchema),
};

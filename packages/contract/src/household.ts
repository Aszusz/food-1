import { oc } from "@orpc/contract";
import { z } from "zod";

export const householdSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const householdContract = {
  current: oc.output(householdSchema.nullable()),
  create: oc
    .input(z.object({ name: z.string().trim().min(1) }))
    .output(householdSchema),
};

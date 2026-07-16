import { oc } from "@orpc/contract";
import { z } from "zod";

export const householdSchema = z.object({
  id: z.string(),
  name: z.string(),
});

const memberSchema = z.object({ id: z.string(), email: z.string() });
const inviteSchema = z.object({ token: z.string() });

export const householdContract = {
  current: oc.output(householdSchema.nullable()),
  create: oc
    .input(z.object({ name: z.string().trim().min(1) }))
    .output(householdSchema),
  members: oc.output(z.array(memberSchema)),
  createInvite: oc.output(inviteSchema),
  acceptInvite: oc.input(inviteSchema).output(householdSchema),
  leave: oc.output(z.void()),
};

import {
  acceptInvite,
  createHousehold,
  createInvite,
  getHousehold,
  getInvite,
  getMembers,
  leaveHousehold,
} from "@monobara/db";
import { ORPCError } from "@orpc/server";
import { os, userId } from "./orpc";

export const householdRouter = {
  current: os.household.current.handler(({ context }) =>
    getHousehold(userId(context)),
  ),
  create: os.household.create.handler(({ context, input }) =>
    createHousehold(userId(context), input.name),
  ),
  members: os.household.members.handler(async ({ context }) => {
    const household = await requireHousehold(userId(context));
    return getMembers(household.id);
  }),
  createInvite: os.household.createInvite.handler(async ({ context }) => {
    const household = await requireHousehold(userId(context));
    return createInvite(household.id);
  }),
  acceptInvite: os.household.acceptInvite.handler(
    async ({ context, input }) => {
      const id = userId(context);
      const invite = await getInvite(input.token);
      if (!invite) throw new ORPCError("NOT_FOUND");
      const existingHousehold = await getHousehold(id);
      if (existingHousehold) {
        if (existingHousehold.id === invite.householdId) return existingHousehold;
        throw new ORPCError("CONFLICT");
      }
      const household = await acceptInvite(id, input.token);
      if (!household) throw new ORPCError("NOT_FOUND");
      return household;
    },
  ),
  leave: os.household.leave.handler(async ({ context }) => {
    await leaveHousehold(userId(context));
  }),
};

async function requireHousehold(id: string) {
  const household = await getHousehold(id);
  if (!household) throw new ORPCError("FORBIDDEN");
  return household;
}

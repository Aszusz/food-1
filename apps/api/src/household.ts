import { createHousehold, getHousehold } from "@monobara/db";
import { os, userId } from "./orpc";

export const householdRouter = {
  current: os.household.current.handler(({ context }) =>
    getHousehold(userId(context)),
  ),
  create: os.household.create.handler(({ context, input }) =>
    createHousehold(userId(context), input.name),
  ),
};

import { getHousehold } from "@monobara/db";
import { ORPCError } from "@orpc/server";
import { os, userId } from "./orpc";

export const recipesRouter = {
  list: os.recipes.list.handler(async ({ context }) => {
    if (!(await getHousehold(userId(context)))) {
      throw new ORPCError("FORBIDDEN");
    }
    return [];
  }),
};

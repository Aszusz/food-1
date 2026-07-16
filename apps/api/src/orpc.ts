import { contract } from "@monobara/contract";
import { implement, ORPCError } from "@orpc/server";

export const os = implement(contract);

export function userId(context: unknown) {
  const userId = (context as { userId?: string }).userId;
  if (!userId) throw new ORPCError("UNAUTHORIZED");
  return userId;
}

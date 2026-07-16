import type { AppRouter } from "@monobara/contract";
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { ContractRouterClient } from "@orpc/contract";

const link = new RPCLink({
  url: new URL("/rpc", import.meta.env.VITE_API_URL || window.location.origin),
  fetch: (request, init) => fetch(request, { ...init, credentials: "include" }),
});

export const orpc: ContractRouterClient<AppRouter> = createORPCClient(link);

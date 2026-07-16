import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "./auth";
import { router } from "./router";

const app = new Hono();
const port = Number(process.env.PORT);
const handler = new RPCHandler(router, {
  interceptors: [onError(console.error)],
});

app.use(
  "*",
  cors({
    origin: process.env.WEB_URL,
    credentials: true,
  }),
);

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.use("/rpc/*", async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  const { matched, response } = await handler.handle(c.req.raw, {
    context: { userId: session?.user.id },
    prefix: "/rpc",
  });

  if (matched) return c.newResponse(response.body, response);
  await next();
});

app.get("/health", (c) => c.json({ ok: true }));

Bun.serve({
  fetch: app.fetch,
  port,
});

console.log(`API listening on ${process.env.BETTER_AUTH_URL}`);

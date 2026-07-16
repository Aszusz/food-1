import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { authClient } from "../auth-client";

export const Route = createFileRoute("/_protected")({
  beforeLoad: async () => {
    const session = await authClient.getSession();

    if (!session.data) {
      throw redirect({ to: "/login" });
    }
  },
  component: ProtectedLayout,
});

function ProtectedLayout() {
  return <Outlet />;
}

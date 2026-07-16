import { createFileRoute, redirect } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { orpc } from "../../orpc";

export const Route = createFileRoute("/_protected/settings")({
  beforeLoad: async () => {
    if (!(await orpc.household.current())) {
      throw redirect({ href: "/household/create" });
    }
  },
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <main className="min-h-screen px-4 py-10">
      <Card className="mx-auto max-w-2xl rounded-3xl border-white/10 bg-card shadow-2xl">
        <CardHeader>
          <CardTitle className="text-3xl tracking-tight">Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <nav aria-label="Settings" className="grid gap-3 sm:grid-cols-3">
            <a
              href="/settings/household"
              className="rounded-xl border border-white/10 p-4 font-medium transition-colors hover:bg-accent"
            >
              Household
            </a>
            <a
              href="/settings/profile"
              className="rounded-xl border border-white/10 p-4 font-medium transition-colors hover:bg-accent"
            >
              Profile
            </a>
            <a
              href="/settings/app"
              className="rounded-xl border border-white/10 p-4 font-medium transition-colors hover:bg-accent"
            >
              App Settings
            </a>
          </nav>
        </CardContent>
      </Card>
    </main>
  );
}

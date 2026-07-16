import { createFileRoute, redirect } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { orpc } from "../../orpc";

export const Route = createFileRoute("/_protected/shopping")({
  beforeLoad: async () => {
    if (!(await orpc.household.current())) {
      throw redirect({ href: "/household/create" });
    }
  },
  component: ShoppingPage,
});

function ShoppingPage() {
  return (
    <main className="min-h-screen px-4 py-10">
      <Card className="mx-auto max-w-2xl rounded-3xl border-white/10 bg-card shadow-2xl">
        <CardHeader className="flex-row items-center justify-between gap-4">
          <CardTitle className="text-3xl tracking-tight">
            Shopping list
          </CardTitle>
          <Button type="button">Add Item</Button>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No shopping items yet</p>
        </CardContent>
      </Card>
    </main>
  );
}

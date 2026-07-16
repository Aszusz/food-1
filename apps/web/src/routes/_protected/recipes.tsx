import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { orpc } from "../../orpc";

export const Route = createFileRoute("/_protected/recipes")({
  beforeLoad: async () => {
    if (!(await orpc.household.current())) {
      throw redirect({ href: "/household/create" });
    }
  },
  component: RecipesPage,
});

function RecipesPage() {
  const { data: recipes = [] } = useQuery({
    queryKey: ["recipes"],
    queryFn: () => orpc.recipes.list(),
  });

  return (
    <main className="min-h-screen px-4 py-10">
      <Card className="mx-auto max-w-2xl rounded-3xl border-white/10 bg-card shadow-2xl">
        <CardHeader>
          <CardTitle className="text-3xl tracking-tight">Recipes</CardTitle>
        </CardHeader>
        <CardContent>
          {recipes.length === 0 && (
            <p className="text-muted-foreground">No recipes yet</p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

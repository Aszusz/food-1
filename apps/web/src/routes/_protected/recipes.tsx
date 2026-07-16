import { useQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
  useRouterState,
} from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
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
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const { data: recipes = [] } = useQuery({
    queryKey: ["recipes"],
    queryFn: () => orpc.recipes.list(),
  });
  if (pathname !== "/recipes") return <Outlet />;

  return (
    <main className="min-h-screen px-4 py-10">
      <Card className="mx-auto max-w-2xl rounded-3xl border-white/10 bg-card shadow-2xl">
        <CardHeader>
          <CardTitle className="text-3xl tracking-tight">Recipes</CardTitle>
        </CardHeader>
        <CardContent>
          {recipes.length === 0 ? (
            <div className="flex items-center justify-between gap-4">
              <p className="text-muted-foreground">No recipes yet</p>
              <Button render={<Link to="/recipes/new" />}>New Recipe</Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Button render={<Link to="/recipes/new" />}>New Recipe</Button>
              <div className="grid gap-2">
                {recipes.map((recipe) => (
                  <Link
                    key={recipe.id}
                    to="/recipes/$recipeId"
                    params={{ recipeId: recipe.id }}
                    className="rounded-xl border border-white/10 px-4 py-3 font-medium transition-colors hover:bg-accent"
                  >
                    {recipe.title}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

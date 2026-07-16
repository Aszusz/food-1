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
import { orpc } from "../../../orpc";

export const Route = createFileRoute("/_protected/recipes/$recipeId")({
  beforeLoad: async ({ params }) => {
    if (!(await orpc.household.current()))
      throw redirect({ href: "/household/create" });
    try {
      await orpc.recipes.get({ id: params.recipeId });
    } catch {
      throw redirect({ href: "/recipes" });
    }
  },
  component: RecipeDetailPage,
});

function RecipeDetailPage() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const { recipeId } = Route.useParams();
  const { data: recipe } = useQuery({
    queryKey: ["recipe", recipeId],
    queryFn: () => orpc.recipes.get({ id: recipeId }),
  });
  if (pathname.endsWith("/edit")) return <Outlet />;
  if (!recipe) return null;

  return (
    <main className="min-h-screen px-4 py-10">
      <Card className="mx-auto max-w-3xl rounded-3xl border-white/10 bg-card shadow-2xl">
        <CardHeader className="flex-row items-start justify-between gap-4">
          <div>
            <Link
              to="/recipes"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Recipes
            </Link>
            <CardTitle className="mt-3 text-3xl tracking-tight">
              {recipe.title}
            </CardTitle>
            {recipe.description && (
              <p className="mt-2 text-muted-foreground">{recipe.description}</p>
            )}
          </div>
          <Button
            render={<Link to="/recipes/$recipeId/edit" params={{ recipeId }} />}
          >
            Edit Recipe
          </Button>
        </CardHeader>
        <CardContent className="grid gap-6">
          <section aria-label="Ingredients">
            <h2 className="mb-2 text-lg font-semibold">Ingredients</h2>
            <ol className="grid gap-1">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index}>
                  {[
                    ingredient.quantity,
                    ingredient.unit,
                    ingredient.name,
                    ingredient.note,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                </li>
              ))}
            </ol>
          </section>
          <section aria-label="Cooking steps">
            <h2 className="mb-2 text-lg font-semibold">Steps</h2>
            <ol className="grid gap-2">
              {recipe.steps.map((step, index) => (
                <li key={index}>{step.text}</li>
              ))}
            </ol>
          </section>
        </CardContent>
      </Card>
    </main>
  );
}

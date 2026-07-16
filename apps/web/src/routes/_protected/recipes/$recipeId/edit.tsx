import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { RecipeEditor } from "@/components/recipe-editor";
import { orpc } from "../../../../orpc";
import { RecipeFormPage } from "../new";

export const Route = createFileRoute("/_protected/recipes/$recipeId/edit")({
  beforeLoad: async ({ params }) => {
    if (!(await orpc.household.current()))
      throw redirect({ href: "/household/create" });
    try {
      await orpc.recipes.get({ id: params.recipeId });
    } catch {
      throw redirect({ href: "/recipes" });
    }
  },
  component: EditRecipePage,
});

function EditRecipePage() {
  const { recipeId } = Route.useParams();
  const { data: recipe } = useQuery({
    queryKey: ["recipe", recipeId],
    queryFn: () => orpc.recipes.get({ id: recipeId }),
  });
  if (!recipe) return null;
  return (
    <RecipeFormPage title="Edit Recipe">
      <RecipeEditor recipe={recipe} />
    </RecipeFormPage>
  );
}

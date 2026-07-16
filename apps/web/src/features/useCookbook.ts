import type { Ingredient, Overview, Recipe } from "@monobara/contract";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "../orpc";

const key = ["cookbook"] as const;

export type RecipeInput = Pick<
  Recipe,
  "title" | "description" | "prepMinutes" | "cookMinutes" | "servings" | "steps"
> & { id?: string; ingredients: Ingredient[] };

export function useCookbook() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: key,
    queryFn: () => orpc.cookbook.overview(),
    refetchInterval: 4000,
  });
  const apply = (overview: Overview) => queryClient.setQueryData(key, overview);

  const createHousehold = useMutation({
    mutationFn: (name: string) => orpc.cookbook.createHousehold({ name }),
    onSuccess: apply,
  });
  const joinHousehold = useMutation({
    mutationFn: (inviteCode: string) =>
      orpc.cookbook.joinHousehold({ inviteCode }),
    onSuccess: apply,
  });
  const saveRecipe = useMutation({
    mutationFn: (recipe: RecipeInput) => orpc.cookbook.saveRecipe(recipe),
    onSuccess: apply,
  });
  const deleteRecipe = useMutation({
    mutationFn: (id: string) => orpc.cookbook.deleteRecipe({ id }),
    onSuccess: apply,
  });
  const toggleFavorite = useMutation({
    mutationFn: (id: string) => orpc.cookbook.toggleFavorite({ id }),
    onSuccess: apply,
  });
  const addRecipeToList = useMutation({
    mutationFn: (id: string) => orpc.cookbook.addRecipeToList({ id }),
    onSuccess: apply,
  });
  const addShoppingItem = useMutation({
    mutationFn: ({ name, amount }: { name: string; amount: string }) =>
      orpc.cookbook.addShoppingItem({ name, amount }),
    onSuccess: apply,
  });
  const toggleShoppingItem = useMutation({
    mutationFn: (id: string) => orpc.cookbook.toggleShoppingItem({ id }),
    onSuccess: apply,
  });
  const deleteShoppingItem = useMutation({
    mutationFn: (id: string) => orpc.cookbook.deleteShoppingItem({ id }),
    onSuccess: apply,
  });
  const clearPurchased = useMutation({
    mutationFn: () => orpc.cookbook.clearPurchased(),
    onSuccess: apply,
  });

  return {
    overview: query.data,
    loading: query.isLoading,
    createHousehold: createHousehold.mutateAsync,
    joinHousehold: joinHousehold.mutateAsync,
    saveRecipe: saveRecipe.mutateAsync,
    deleteRecipe: deleteRecipe.mutateAsync,
    toggleFavorite: toggleFavorite.mutateAsync,
    addRecipeToList: addRecipeToList.mutateAsync,
    addShoppingItem: addShoppingItem.mutateAsync,
    toggleShoppingItem: toggleShoppingItem.mutateAsync,
    deleteShoppingItem: deleteShoppingItem.mutateAsync,
    clearPurchased: clearPurchased.mutateAsync,
  };
}

export type Cookbook = ReturnType<typeof useCookbook>;

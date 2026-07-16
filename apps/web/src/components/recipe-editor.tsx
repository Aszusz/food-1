import { useMutation } from "@tanstack/react-query";
import type { FormEvent } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { orpc } from "@/orpc";

type Recipe = Awaited<ReturnType<typeof orpc.recipes.get>>;
type Ingredient = Recipe["ingredients"][number];

export function RecipeEditor({ recipe }: { recipe?: Recipe }) {
  const [title, setTitle] = useState(recipe?.title ?? "");
  const [description, setDescription] = useState(recipe?.description ?? "");
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    recipe?.ingredients ?? [],
  );
  const [steps, setSteps] = useState(recipe?.steps ?? []);
  const save = useMutation({
    mutationFn: () =>
      recipe
        ? orpc.recipes.update({
            id: recipe.id,
            title,
            description,
            ingredients,
            steps,
          })
        : orpc.recipes.create({ title, description, ingredients, steps }),
  });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const saved = await save.mutateAsync();
    window.location.href = `/recipes/${saved.id}`;
  }

  return (
    <form onSubmit={submit} className="grid gap-6">
      <div className="grid gap-2">
        <Label htmlFor="recipe-title">Title</Label>
        <Input
          id="recipe-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="recipe-description">Description</Label>
        <textarea
          id="recipe-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="min-h-24 rounded-md border border-input bg-background px-3 py-2 outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        />
      </div>
      <section className="grid gap-3" aria-label="Ingredients">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Ingredients</h2>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setIngredients((current) => [
                ...current,
                { name: "", quantity: "", unit: "", note: "" },
              ])
            }
          >
            Add ingredient
          </Button>
        </div>
        {ingredients.map((ingredient, index) => (
          <fieldset
            key={index}
            aria-label="Ingredient"
            className="grid gap-2 rounded-xl border border-white/10 p-3 sm:grid-cols-5"
          >
            <Input
              aria-label="Name"
              value={ingredient.name}
              onChange={(event) =>
                setIngredient(index, { name: event.target.value })
              }
              required
            />
            <Input
              aria-label="Quantity"
              value={ingredient.quantity}
              onChange={(event) =>
                setIngredient(index, { quantity: event.target.value })
              }
              required
            />
            <Input
              aria-label="Unit"
              value={ingredient.unit}
              onChange={(event) =>
                setIngredient(index, { unit: event.target.value })
              }
              required
            />
            <Input
              aria-label="Note"
              value={ingredient.note}
              onChange={(event) =>
                setIngredient(index, { note: event.target.value })
              }
            />
            <div className="flex gap-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                aria-label={`Move ingredient ${ingredient.name} up`}
                disabled={index === 0}
                onClick={() =>
                  setIngredients((current) => moveUp(current, index))
                }
              >
                Up
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                aria-label={`Remove ingredient ${ingredient.name}`}
                onClick={() =>
                  setIngredients((current) =>
                    current.filter((_, itemIndex) => itemIndex !== index),
                  )
                }
              >
                Remove
              </Button>
            </div>
          </fieldset>
        ))}
      </section>
      <section className="grid gap-3" aria-label="Cooking steps">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Steps</h2>
          <Button
            type="button"
            variant="outline"
            onClick={() => setSteps((current) => [...current, { text: "" }])}
          >
            Add step
          </Button>
        </div>
        {steps.map((step, index) => (
          <div key={index} className="flex gap-2">
            <Input
              aria-label="Cooking step"
              value={step.text}
              onChange={(event) =>
                setSteps((current) =>
                  current.map((item, itemIndex) =>
                    itemIndex === index ? { text: event.target.value } : item,
                  ),
                )
              }
              required
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-label={`Move step ${step.text} up`}
              disabled={index === 0}
              onClick={() => setSteps((current) => moveUp(current, index))}
            >
              Up
            </Button>
          </div>
        ))}
      </section>
      <Button type="submit" disabled={save.isPending}>
        Save recipe
      </Button>
    </form>
  );

  function setIngredient(index: number, value: Partial<Ingredient>) {
    setIngredients((current) =>
      current.map((ingredient, itemIndex) =>
        itemIndex === index ? { ...ingredient, ...value } : ingredient,
      ),
    );
  }
}

function moveUp<T>(items: T[], index: number) {
  if (index === 0) return items;
  const result = [...items];
  [result[index - 1], result[index]] = [result[index], result[index - 1]];
  return result;
}

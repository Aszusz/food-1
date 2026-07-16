import { useMutation } from "@tanstack/react-query";
import { useBlocker } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import type { FormEvent, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { orpc } from "@/orpc";

type Recipe = Awaited<ReturnType<typeof orpc.recipes.get>>;
type Ingredient = Recipe["ingredients"][number];
type Step = Recipe["steps"][number];
type IngredientRow = Ingredient & { id: string };
type StepRow = Step & { id: string };

export function RecipeEditor({ recipe }: { recipe?: Recipe }) {
  const [title, setTitle] = useState(recipe?.title ?? "");
  const [description, setDescription] = useState(recipe?.description ?? "");
  const [ingredients, setIngredients] = useState<IngredientRow[]>(() =>
    (recipe?.ingredients ?? []).map(createIngredient),
  );
  const [ingredientDraft, setIngredientDraft] =
    useState<Ingredient>(emptyIngredient);
  const [editingIngredientId, setEditingIngredientId] = useState<string | null>(
    null,
  );
  const [ingredientError, setIngredientError] = useState("");
  const [steps, setSteps] = useState<StepRow[]>(() =>
    (recipe?.steps ?? []).map(createStep),
  );
  const pendingFocus = useRef<string>(null);
  const ingredientDraftHasContent =
    Object.values(ingredientDraft).some(Boolean);
  const initial = JSON.stringify({
    title: recipe?.title ?? "",
    description: recipe?.description ?? "",
    ingredients: recipe?.ingredients ?? [],
    steps: recipe?.steps ?? [],
  });
  const dirty =
    ingredientDraftHasContent ||
    JSON.stringify({
      title,
      description,
      ingredients: ingredients.map(withoutId),
      steps: steps.map(withoutId),
    }) !== initial;

  useBlocker({
    shouldBlockFn: () =>
      dirty && !window.confirm("Discard your unsaved recipe changes?"),
    enableBeforeUnload: () => dirty,
  });

  useEffect(() => {
    if (!pendingFocus.current) return;
    document.getElementById(pendingFocus.current)?.focus();
    pendingFocus.current = null;
  }, [ingredients, steps]);

  const save = useMutation({
    mutationFn: () => {
      const input = {
        title,
        description,
        ingredients: ingredients.map(withoutId),
        steps: steps.map(withoutId),
      };
      return recipe
        ? orpc.recipes.update({ id: recipe.id, ...input })
        : orpc.recipes.create(input);
    },
  });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (ingredientDraftHasContent) {
      setIngredientError(
        "Add this ingredient or clear the row before saving the recipe.",
      );
      document.getElementById("ingredient-draft-name")?.focus();
      return;
    }
    try {
      const saved = await save.mutateAsync();
      window.location.href = `/recipes/${saved.id}`;
    } catch {
      // The mutation state renders recovery guidance below the form.
    }
  }

  function saveIngredient() {
    const missing = (["name", "quantity", "unit"] as const).find(
      (field) => !ingredientDraft[field].trim(),
    );
    if (missing) {
      setIngredientError("Name, quantity and unit are required.");
      document.getElementById(`ingredient-draft-${missing}`)?.focus();
      return;
    }

    setIngredients((current) =>
      editingIngredientId
        ? current.map((ingredient) =>
            ingredient.id === editingIngredientId
              ? { ...ingredientDraft, id: ingredient.id }
              : ingredient,
          )
        : [...current, createIngredient(ingredientDraft)],
    );
    clearIngredientDraft();
    pendingFocus.current = "ingredient-draft-name";
  }

  function addStep() {
    const step = createStep({ text: "" });
    pendingFocus.current = `step-${step.id}`;
    setSteps((current) => [...current, step]);
  }

  function editIngredient(ingredient: IngredientRow) {
    setIngredientDraft(withoutId(ingredient));
    setEditingIngredientId(ingredient.id);
    setIngredientError("");
    document.getElementById("ingredient-draft-name")?.focus();
  }

  function updateIngredientDraft(change: Partial<Ingredient>) {
    setIngredientDraft((current) => ({ ...current, ...change }));
    setIngredientError("");
  }

  function clearIngredientDraft() {
    setIngredientDraft(emptyIngredient());
    setEditingIngredientId(null);
    setIngredientError("");
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
      <section
        className="grid gap-4 border-t border-white/10 pt-6"
        aria-label="Ingredients"
      >
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold tracking-tight">Ingredients</h2>
          {ingredients.length > 0 && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {ingredients.length}
            </span>
          )}
        </div>
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-background/30 shadow-sm">
          <table className="w-full min-w-[48rem] border-collapse text-sm">
            <caption className="sr-only">
              Recipe ingredients and ingredient entry form
            </caption>
            <thead className="bg-muted/40 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <tr>
                <th scope="col" className="w-[25%] px-4 py-3">
                  Name
                </th>
                <th scope="col" className="w-[12%] px-3 py-3">
                  Quantity
                </th>
                <th scope="col" className="w-[14%] px-3 py-3">
                  Unit
                </th>
                <th scope="col" className="px-3 py-3">
                  Note
                </th>
                <th scope="col" className="w-48 px-3 py-3 text-right">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {ingredients.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-5 text-muted-foreground">
                    Add the ingredients people need to make this recipe.
                  </td>
                </tr>
              )}
              {ingredients.map((ingredient, index) => (
                <tr
                  key={ingredient.id}
                  aria-label={`Ingredient ${ingredient.name}`}
                  className="transition-colors hover:bg-accent/40"
                >
                  <th scope="row" className="px-4 py-3 text-left font-medium">
                    {ingredient.name}
                  </th>
                  <td className="px-3 py-3">{ingredient.quantity}</td>
                  <td className="px-3 py-3">{ingredient.unit}</td>
                  <td className="px-3 py-3 text-muted-foreground">
                    {ingredient.note}
                  </td>
                  <td className="px-2 py-1">
                    <RowActions
                      item="ingredient"
                      name={ingredient.name}
                      index={index}
                      length={ingredients.length}
                      onEdit={() => editIngredient(ingredient)}
                      onUp={() =>
                        setIngredients((current) => moveUp(current, index))
                      }
                      onDown={() =>
                        setIngredients((current) => moveDown(current, index))
                      }
                      onRemove={() => {
                        setIngredients((current) =>
                          current.filter((item) => item.id !== ingredient.id),
                        );
                        if (editingIngredientId === ingredient.id)
                          clearIngredientDraft();
                      }}
                    />
                  </td>
                </tr>
              ))}
              <tr
                aria-label={
                  editingIngredientId ? "Edit ingredient" : "New ingredient"
                }
                className="bg-primary/5 align-top"
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    event.target instanceof HTMLInputElement
                  ) {
                    event.preventDefault();
                    saveIngredient();
                  }
                }}
              >
                <td className="p-2 pl-3">
                  <Label htmlFor="ingredient-draft-name" className="sr-only">
                    Name
                  </Label>
                  <Input
                    id="ingredient-draft-name"
                    value={ingredientDraft.name}
                    placeholder="Chickpeas"
                    aria-required="true"
                    aria-invalid={
                      Boolean(ingredientError) && !ingredientDraft.name.trim()
                    }
                    onChange={(event) =>
                      updateIngredientDraft({ name: event.target.value })
                    }
                  />
                </td>
                <td className="p-2">
                  <Label
                    htmlFor="ingredient-draft-quantity"
                    className="sr-only"
                  >
                    Quantity
                  </Label>
                  <Input
                    id="ingredient-draft-quantity"
                    value={ingredientDraft.quantity}
                    placeholder="2"
                    aria-required="true"
                    aria-invalid={
                      Boolean(ingredientError) &&
                      !ingredientDraft.quantity.trim()
                    }
                    onChange={(event) =>
                      updateIngredientDraft({ quantity: event.target.value })
                    }
                  />
                </td>
                <td className="p-2">
                  <Label htmlFor="ingredient-draft-unit" className="sr-only">
                    Unit
                  </Label>
                  <Input
                    id="ingredient-draft-unit"
                    value={ingredientDraft.unit}
                    placeholder="Cans"
                    aria-required="true"
                    aria-invalid={
                      Boolean(ingredientError) && !ingredientDraft.unit.trim()
                    }
                    onChange={(event) =>
                      updateIngredientDraft({ unit: event.target.value })
                    }
                  />
                </td>
                <td className="p-2">
                  <Label htmlFor="ingredient-draft-note" className="sr-only">
                    Note
                  </Label>
                  <Input
                    id="ingredient-draft-note"
                    value={ingredientDraft.note}
                    placeholder="Drained"
                    onChange={(event) =>
                      updateIngredientDraft({ note: event.target.value })
                    }
                  />
                </td>
                <td className="p-2 pr-3">
                  <Button
                    type="button"
                    className="h-10 w-full px-3"
                    onClick={saveIngredient}
                  >
                    <Plus aria-hidden="true" className="size-4" />
                    {editingIngredientId
                      ? "Update ingredient"
                      : "Add ingredient"}
                  </Button>
                  {editingIngredientId && (
                    <Button
                      type="button"
                      variant="ghost"
                      className="mt-1 h-8 w-full text-muted-foreground"
                      onClick={() => {
                        clearIngredientDraft();
                        document
                          .getElementById("ingredient-draft-name")
                          ?.focus();
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        {ingredientError && (
          <p role="alert" className="text-sm text-destructive">
            {ingredientError}
          </p>
        )}
      </section>
      <ListSection
        title="Steps"
        addLabel="Add step"
        empty="Add the cooking steps in the order they should happen."
        count={steps.length}
        onAdd={addStep}
      >
        <ol className="grid gap-3">
          {steps.map((step, index) => (
            <li
              key={step.id}
              className="rounded-2xl border border-white/10 bg-background/40 p-4 shadow-sm"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <Label htmlFor={`step-${step.id}`}>
                  <span className="flex size-7 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                    {index + 1}
                  </span>
                  Step {index + 1}
                </Label>
                <RowActions
                  item="step"
                  name={step.text}
                  index={index}
                  length={steps.length}
                  onUp={() => setSteps((current) => moveUp(current, index))}
                  onDown={() => setSteps((current) => moveDown(current, index))}
                  onRemove={() =>
                    setSteps((current) =>
                      current.filter((item) => item.id !== step.id),
                    )
                  }
                />
              </div>
              <textarea
                id={`step-${step.id}`}
                value={step.text}
                onChange={(event) =>
                  setSteps((current) =>
                    current.map((item) =>
                      item.id === step.id
                        ? { ...item, text: event.target.value }
                        : item,
                    ),
                  )
                }
                rows={2}
                placeholder="Describe what to do"
                className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-base shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 md:text-sm"
                required
              />
            </li>
          ))}
        </ol>
      </ListSection>
      {save.isError && (
        <Alert variant="destructive">
          <AlertDescription>
            Could not save this recipe. Check your connection and try again.
          </AlertDescription>
        </Alert>
      )}
      <div className="sticky bottom-4 z-10 bg-card pt-2">
        <Button type="submit" disabled={save.isPending} className="w-full">
          {save.isPending ? "Saving recipe..." : "Save recipe"}
        </Button>
      </div>
    </form>
  );
}

function ListSection({
  title,
  addLabel,
  empty,
  count,
  onAdd,
  children,
}: {
  title: string;
  addLabel: string;
  empty: string;
  count: number;
  onAdd: () => void;
  children: ReactNode;
}) {
  return (
    <section
      className="grid gap-4 border-t border-white/10 pt-6"
      aria-label={title}
    >
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        {count > 0 && (
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {count}
          </span>
        )}
      </div>
      {count > 0 ? (
        children
      ) : (
        <p className="rounded-2xl border border-dashed border-white/15 bg-background/20 px-4 py-5 text-sm text-muted-foreground">
          {empty}
        </p>
      )}
      <Button
        type="button"
        variant="outline"
        className="h-11 w-full border-dashed bg-transparent text-muted-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
        onClick={onAdd}
      >
        <Plus aria-hidden="true" className="size-4" />
        {addLabel}
      </Button>
    </section>
  );
}

function RowActions({
  item,
  name,
  index,
  length,
  onEdit,
  onUp,
  onDown,
  onRemove,
}: {
  item: string;
  name: string;
  index: number;
  length: number;
  onEdit?: () => void;
  onUp: () => void;
  onDown: () => void;
  onRemove: () => void;
}) {
  const label = name || `${index + 1}`;

  return (
    <div className="flex shrink-0 justify-end gap-1">
      {onEdit && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-11 text-muted-foreground"
          aria-label={`Edit ${item} ${label}`}
          title="Edit"
          onClick={onEdit}
        >
          <Pencil aria-hidden="true" className="size-4" />
        </Button>
      )}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-11 text-muted-foreground"
        aria-label={`Move ${item} ${label} up`}
        title="Move up"
        disabled={index === 0}
        onClick={onUp}
      >
        <ArrowUp aria-hidden="true" className="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-11 text-muted-foreground"
        aria-label={`Move ${item} ${label} down`}
        title="Move down"
        disabled={index === length - 1}
        onClick={onDown}
      >
        <ArrowDown aria-hidden="true" className="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-11 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        aria-label={`Remove ${item} ${label}`}
        title="Remove"
        onClick={onRemove}
      >
        <Trash2 aria-hidden="true" className="size-4" />
      </Button>
    </div>
  );
}

function createIngredient(ingredient: Ingredient): IngredientRow {
  return { ...ingredient, id: crypto.randomUUID() };
}
function createStep(step: Step): StepRow {
  return { ...step, id: crypto.randomUUID() };
}
function withoutId<T extends { id: string }>({
  id: _,
  ...item
}: T): Omit<T, "id"> {
  return item;
}
function emptyIngredient(): Ingredient {
  return { name: "", quantity: "", unit: "", note: "" };
}
function moveUp<T>(items: T[], index: number) {
  if (index === 0) return items;
  const result = [...items];
  [result[index - 1], result[index]] = [result[index], result[index - 1]];
  return result;
}
function moveDown<T>(items: T[], index: number) {
  return moveUp(items, index + 1);
}

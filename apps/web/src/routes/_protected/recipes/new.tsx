import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { RecipeEditor } from "@/components/recipe-editor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { orpc } from "../../../orpc";

export const Route = createFileRoute("/_protected/recipes/new")({
  beforeLoad: async () => {
    if (!(await orpc.household.current()))
      throw redirect({ href: "/household/create" });
  },
  component: NewRecipePage,
});

function NewRecipePage() {
  return <RecipeFormPage title="New Recipe" />;
}

export function RecipeFormPage({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <main className="min-h-screen px-4 py-10">
      <Card className="mx-auto max-w-3xl rounded-3xl border-white/10 bg-card shadow-2xl">
        <CardHeader className="flex-row items-center justify-between gap-4">
          <CardTitle className="text-3xl tracking-tight">{title}</CardTitle>
          <Link
            to="/recipes"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Cancel
          </Link>
        </CardHeader>
        <CardContent>{children ?? <RecipeEditor />}</CardContent>
      </Card>
    </main>
  );
}

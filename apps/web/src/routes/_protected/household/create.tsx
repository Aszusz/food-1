import { useMutation } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import type { FormEvent } from "react";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { orpc } from "../../../orpc";

export const Route = createFileRoute("/_protected/household/create")({
  beforeLoad: async () => {
    if (await orpc.household.current()) {
      throw redirect({ href: "/recipes" });
    }
  },
  component: CreateHouseholdPage,
});

function CreateHouseholdPage() {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const create = useMutation({
    mutationFn: (name: string) => orpc.household.create({ name }),
  });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      await create.mutateAsync(name);
      window.location.href = "/recipes";
    } catch {
      setError("Could not create household");
    }
  }

  return (
    <main className="min-h-screen px-4 py-10">
      <Card className="mx-auto max-w-sm rounded-3xl border-white/10 bg-card shadow-2xl">
        <CardHeader className="gap-2 text-center">
          <CardTitle className="text-3xl tracking-tight">
            Create your household
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Start the shared space for recipes and shopping.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit}>
            <Label htmlFor="household-name">Household name</Label>
            <Input
              id="household-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="The Smith kitchen"
              className="mt-2 h-12 rounded-xl bg-muted"
              required
            />
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button
              type="submit"
              className="mt-6 w-full rounded-xl"
              disabled={create.isPending}
            >
              Create household
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

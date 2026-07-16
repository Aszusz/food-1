import { useMutation } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { authClient } from "../../auth-client";
import { orpc } from "../../orpc";

export const Route = createFileRoute("/invite/$token")({
  beforeLoad: async ({ params }) => {
    const session = await authClient.getSession();
    if (!session.data) {
      throw redirect({
        href: `/signup?returnTo=${encodeURIComponent(`/invite/${params.token}`)}`,
      });
    }
  },
  component: AcceptInvitePage,
});

function AcceptInvitePage() {
  const { token } = Route.useParams();
  const acceptInvite = useMutation({
    mutationFn: () => orpc.household.acceptInvite({ token }),
  });

  useEffect(() => {
    acceptInvite.mutate(undefined, {
      onSuccess: () => {
        window.location.href = "/recipes";
      },
    });
  }, [token]);

  if (acceptInvite.isError) {
    return (
      <main className="p-10">
        <Alert variant="destructive">
          <AlertDescription>
            This invitation can't be accepted.
          </AlertDescription>
        </Alert>
        <Button
          className="mt-4"
          onClick={() => (window.location.href = "/recipes")}
        >
          Return to recipes
        </Button>
      </main>
    );
  }

  return <main className="p-10">Joining household...</main>;
}

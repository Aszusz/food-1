import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { orpc } from "../../../orpc";

export const Route = createFileRoute("/_protected/settings/household")({
  beforeLoad: async () => {
    if (!(await orpc.household.current())) {
      throw redirect({ href: "/household/create" });
    }
  },
  component: HouseholdSettingsPage,
});

function HouseholdSettingsPage() {
  const [inviteToken, setInviteToken] = useState<string>();
  const household = useQuery({
    queryKey: ["household"],
    queryFn: () => orpc.household.current(),
  });
  const members = useQuery({
    queryKey: ["household", "members"],
    queryFn: () => orpc.household.members(),
  });
  const createInvite = useMutation({
    mutationFn: () => orpc.household.createInvite(),
    onSuccess: (invite) => setInviteToken(invite.token),
  });
  const leave = useMutation({
    mutationFn: () => orpc.household.leave(),
    onSuccess: () => {
      window.location.href = "/household/create";
    },
  });
  const inviteLink = inviteToken
    ? `${window.location.origin}/invite/${inviteToken}`
    : "";

  return (
    <main className="min-h-screen px-4 py-10">
      <Card className="mx-auto max-w-2xl rounded-3xl border-white/10 bg-card shadow-2xl">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-3xl tracking-tight">
            {household.data?.name ?? "Household"}
          </CardTitle>
          <Button
            onClick={() => createInvite.mutate()}
            disabled={createInvite.isPending}
          >
            Invite member
          </Button>
        </CardHeader>
        <CardContent>
          <h2 className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Members
          </h2>
          <ul className="mt-3 space-y-2">
            {members.data?.map((member) => (
              <li
                key={member.id}
                className="rounded-xl border border-white/10 p-4"
              >
                {member.email}
              </li>
            ))}
          </ul>
          <Button
            variant="outline"
            className="mt-8"
            onClick={() => leave.mutate()}
            disabled={leave.isPending}
          >
            Leave household
          </Button>
        </CardContent>
      </Card>
      {inviteToken && (
        <dialog
          open
          aria-label="Invite member"
          className="rounded-xl border border-white/10 bg-card p-6 text-foreground shadow-2xl"
        >
          <h2 className="text-xl font-semibold">Invite member</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Share this link with a household member.
          </p>
          <Input
            aria-label="Invite link"
            value={inviteLink}
            readOnly
            className="mt-4"
          />
          <Button
            className="mt-3"
            onClick={() => navigator.clipboard.writeText(inviteLink)}
          >
            Copy link
          </Button>
          <Button
            variant="ghost"
            className="mt-3 ml-2"
            onClick={() => setInviteToken(undefined)}
          >
            Close
          </Button>
        </dialog>
      )}
    </main>
  );
}

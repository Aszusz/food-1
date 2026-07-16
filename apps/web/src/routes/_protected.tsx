import { Menu } from "@base-ui/react/menu";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { appVersion } from "../app-version";
import { authClient } from "../auth-client";

export const Route = createFileRoute("/_protected")({
  beforeLoad: async () => {
    const session = await authClient.getSession();

    if (!session.data) {
      throw redirect({ to: "/login" });
    }
  },
  component: ProtectedLayout,
});

function ProtectedLayout() {
  const { data: session } = authClient.useSession();
  const email = session?.user.email ?? "";
  const avatarLabel = email ? email.slice(0, 1).toUpperCase() : "?";

  return (
    <>
      <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="text-2xl font-semibold tracking-tight">Monobara</div>
        <Menu.Root>
          <Menu.Trigger
            aria-label="Account menu"
            className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground outline-none transition-colors hover:bg-primary/90 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            {avatarLabel}
          </Menu.Trigger>
          <Menu.Portal>
            <Menu.Positioner align="end" sideOffset={8}>
              <Menu.Popup className="z-10 w-64 rounded-md border border-white/10 bg-background p-2 shadow-lg outline-none">
                <div className="truncate px-4 py-2 text-sm text-muted-foreground">
                  {email}
                </div>
                <div className="px-4 pb-2 text-xs text-muted-foreground">
                  v{appVersion}
                </div>
                <Menu.Item
                  className="cursor-pointer rounded-md px-4 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                  onClick={async () => {
                    await authClient.signOut();
                    window.location.href = "/login";
                  }}
                >
                  Sign out
                </Menu.Item>
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.Root>
      </header>
      <Outlet />
    </>
  );
}

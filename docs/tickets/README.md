# Household Cookbook Tickets

## Starting Point

The repository is a Bun/Turborepo monorepo with a React/TanStack Router web app, a Hono/oRPC API, Drizzle/PostgreSQL persistence, Better Auth email/password authentication, and Playwright-BDD E2E tests. It currently implements a per-user todo application only.

The existing authentication, typed contract, database migration, protected-route, UI primitive, CI, and E2E patterns should be reused. The starter schema, API, routes, UI, and tests are starter functionality to replace, not cookbook functionality to extend.

## Ticket Order

1. [Household onboarding replaces the todo starter](01-household-onboarding.md)
2. [Household workspace navigation](02-workspace-navigation.md)
3. [Household invitations](03-household-invitations.md)
4. [Recipe create, view, and edit](04-recipe-create-view-edit.md)
5. [Recipe search and household favorites](05-recipe-search-favorites.md)
6. [Cooking mode](06-cooking-mode.md)
7. [Add recipes to the shared shopping list](07-recipe-shopping-list.md)
8. [Manual shopping and purchase status](08-manual-shopping-items.md)
9. [Live household collaboration](09-live-collaboration.md)
10. [Profile and app settings](10-profile-app-settings.md)

## Dependency Map

```text
01 -> 02 -> 03 ---------------------> 09
       |                                ^
       +-> 04 -> 05 -> 06             |
       |       \-> 07 -> 08 -----------+
       \-> 10
```

## Verification Convention

Each acceptance criterion must be covered by one or more browser E2E scenarios. Add or replace Gherkin feature scenarios and step definitions under `tests/`, using accessible UI interactions against the running web app and real API/database. Existing database reset helpers can create prerequisite accounts through the API, but the behavior being delivered must be exercised in the browser.

Run `bun run test` with PostgreSQL, API, and web app available. Run `bun run qual` before merging when the full development environment is available.

# 01 - Household Onboarding Replaces the Todo Starter

**Type:** AFK
**Blocked by:** None

## What To Build

Replace the starter todo domain and `/todos` destination with the first complete cookbook path: an authenticated account without a household is sent to household onboarding, creates one household, becomes its first member, and enters the Recipes workspace. Persist the household membership and enforce it at the API boundary. Keep Better Auth email/password sign-up and login.

Remove the todo schema, contract, API, routes, UI, and todo-specific E2E scenarios rather than retaining an unrelated feature.

## Acceptance Criteria

- [x] A newly signed-up user is sent to Create Household, not a todo page.
- [x] The user can name and create a household, then lands in the empty Recipes workspace.
- [x] A signed-in member who refreshes remains in their household workspace.
- [x] A signed-in account with no membership is redirected to household onboarding when visiting a workspace URL.
- [x] Anonymous users remain redirected to Log In when visiting a protected URL.
- [x] No todo route, UI, API contract, or database table remains in the application.

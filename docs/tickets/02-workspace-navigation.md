# 02 - Household Workspace Navigation

**Type:** AFK
**Blocked by:** [01 - Household Onboarding Replaces the Todo Starter](01-household-onboarding.md)

## What To Build

Create the authenticated household workspace shell from the information architecture. It shows the household name and persistent primary navigation for Recipes, Shopping, and Settings. Recipes is the default workspace destination and has an empty state with a New Recipe action. Shopping and Settings have their documented empty or entry states. All workspace data access is scoped to the current member's household.

## Acceptance Criteria

- [ ] A household member sees the household name and Recipes, Shopping, and Settings navigation on workspace screens.
- [ ] Recipes is selected by default after household onboarding and login.
- [ ] Each primary navigation control opens its corresponding URL and visibly marks itself selected.
- [ ] The empty Recipes screen exposes New Recipe.
- [ ] The empty Shopping screen exposes Add Item.
- [ ] Workspace navigation is unavailable to users without a household.

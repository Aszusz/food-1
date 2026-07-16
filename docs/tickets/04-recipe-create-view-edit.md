# 04 - Recipe Create, View, and Edit

**Type:** AFK
**Blocked by:** [02 - Household Workspace Navigation](02-workspace-navigation.md)

## What To Build

Implement the central recipe workflow end to end. A household member creates a recipe with title, optional description, ordered ingredients (name, quantity, unit, optional note), and ordered cooking steps. The recipe appears in the household Recipe List, opens Recipe Detail, and can be edited. Recipe reads and writes are restricted to household members.

## Acceptance Criteria

- [ ] New Recipe opens the recipe editor from the Recipe List.
- [ ] A member can add, remove, and order ingredients and steps before saving.
- [ ] Saving creates a recipe visible in Recipe List and Recipe Detail after a refresh.
- [ ] Recipe Detail shows the saved title, description, ingredients, and ordered steps.
- [ ] Edit opens the same editor prefilled and persists changes.
- [ ] A member of another household cannot read or modify the recipe.

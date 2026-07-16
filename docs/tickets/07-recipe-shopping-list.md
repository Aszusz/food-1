# 07 - Add Recipes to the Shared Shopping List

**Type:** AFK
**Blocked by:** [04 - Recipe Create, View, and Edit](04-recipe-create-view-edit.md)

## What To Build

Implement the recipe-to-shopping workflow. Add to Shopping List on Recipe Detail adds its ingredients to the household's single persistent list. Identical ingredient names and units merge into one item with summed quantities and every contributing source recipe. Items with different units remain separate to avoid unsafe conversion. The list persists across refreshes and is visible to all household members.

## Acceptance Criteria

- [ ] Add to Shopping List adds each recipe ingredient to the household Shopping list.
- [ ] Adding recipes that contain the same ingredient name and unit creates one summed list item.
- [ ] The merged item lists every contributing recipe.
- [ ] Same-named ingredients with different units remain distinct items.
- [ ] The recipe-derived list persists after refresh and is inaccessible to other households.

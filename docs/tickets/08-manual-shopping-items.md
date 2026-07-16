# 08 - Manual Shopping Items and Purchase Status

**Type:** AFK
**Blocked by:** [07 - Add Recipes to the Shared Shopping List](07-recipe-shopping-list.md)

## What To Build

Complete the everyday Shopping List workflow. A member can add a manual item with name, quantity, and unit, and can mark recipe-derived or manual items purchased. Active items and purchased items render as separate sections. Checked state persists and does not erase source recipes or manual/recipe origin.

## Acceptance Criteria

- [ ] Add Item opens the manual shopping-item editor and saves a manual item.
- [ ] A manual item is visibly marked as Manual and has no recipe source.
- [ ] Checking an item moves it from To Buy to Purchased.
- [ ] Unchecking a purchased item returns it to To Buy.
- [ ] Purchase status remains correct after a refresh.
- [ ] Recipe-derived items retain their source recipes when checked and unchecked.

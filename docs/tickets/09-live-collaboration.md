# 09 - Live Household Collaboration

**Type:** AFK
**Blocked by:** [03 - Household Invitations](03-household-invitations.md), [08 - Manual Shopping Items and Purchase Status](08-manual-shopping-items.md)

## What To Build

Make shared household data visibly live for concurrently active members. When one member creates or edits a recipe, adds recipe ingredients or manual items, or changes shopping purchase status, another currently open household workspace receives the change without a manual page refresh. Use the smallest reliable update mechanism compatible with the template; the product requires observed live synchronization, not a specific transport.

## Acceptance Criteria

- [ ] Two signed-in members of the same household can keep Recipes or Shopping open concurrently.
- [ ] A recipe created by one member appears for the other without a browser refresh.
- [ ] A manual shopping item added by one member appears for the other without a browser refresh.
- [ ] Checking or unchecking a shopping item updates the other member's list without a browser refresh.
- [ ] Changes from another household are never delivered into the current household workspace.

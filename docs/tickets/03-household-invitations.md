# 03 - Household Invitations

**Type:** AFK
**Blocked by:** [02 - Household Workspace Navigation](02-workspace-navigation.md)

## What To Build

Add Household Settings member management. A member can create an invite link, and an authenticated account without a household can use that link to join the household. A visitor who opens an invite while signed out signs up or logs in first, then returns to accept it. An account remains a member of only one household.

No email delivery is required: copying and opening the invite link is the MVP invitation mechanism.

## Acceptance Criteria

- [ ] Household Settings lists current members and offers Invite Member.
- [ ] Invite Member presents a copyable invite link.
- [ ] A newly signed-up user following that link joins the named household and reaches Recipes.
- [ ] Both members are listed in Household Settings after acceptance.
- [ ] An account that already belongs to a household cannot use an invite to join another one.
- [ ] A member can leave their household and is returned to household onboarding without access to its data.
- [ ] Household-scoped requests reject access from non-members.

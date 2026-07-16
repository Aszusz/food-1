# Information Architecture

## Product Structure

```text
App
│
├── Authentication (signed out)
│   │
│   ├── Sign Up
│   └── Log In
│
├── Household Onboarding (signed in, no household)
│   │
│   ├── Create Household
│   └── Join Household
│       └── Accept Invite
│
└── Household Workspace (signed in)
    │
    ├── Recipes
    │   │
    │   ├── Recipe List
    │   │   ├── Search
    │   │   ├── Favorites (optional)
    │   │   └── New Recipe
    │   │
    │   ├── Recipe Detail
    │   │   ├── Overview
    │   │   ├── Ingredients
    │   │   ├── Steps
    │   │   ├── Cook
    │   │   ├── Add to Shopping List
    │   │   └── Edit
    │   │
    │   ├── Recipe Editor
    │   │   ├── Title
    │   │   ├── Description (optional)
    │   │   ├── Ingredients
    │   │   │   ├── Name
    │   │   │   ├── Quantity
    │   │   │   ├── Unit
    │   │   │   └── Optional Note
    │   │   ├── Steps
    │   │   └── Save
    │   │
    │   └── Cooking Mode
    │       ├── Ingredient Checklist
    │       ├── Step Navigation
    │       └── Finish Cooking
    │
    ├── Shopping
    │   │
    │   ├── Shopping List
    │   │   ├── Active Items
    │   │   ├── Checked Items
    │   │   ├── Manual Items
    │   │   └── Add Manual Item
    │   │
    │   └── Shopping Item
    │       ├── Name
    │       ├── Quantity
    │       ├── Unit
    │       ├── Source Recipe(s)
    │       ├── Checked Status
    │       └── Manual / Recipe Source
    │
    └── Settings
        │
        ├── Household
        │   ├── Members
        │   ├── Invite Member
        │   ├── Invite Link
        │   └── Leave Household
        │
        ├── Profile
        │
        └── App Settings
```

---

# Primary Navigation

Available only within a household workspace:

```text
Recipes     Shopping     Settings
```

---

# Navigation Map

```text
Signed Out
│
├── Sign Up
│     ▼
│   Household Onboarding
│
└── Log In
      ▼
    Household Workspace or Household Onboarding

Household Onboarding
│
├── Create Household
│     ▼
│   Household Workspace
│
└── Accept Invite
      ▼
    Household Workspace

Recipes
│
├── Recipe List
│     │
│     ├── New Recipe
│     │      │
│     │      ▼
│     │   Recipe Editor
│     │
│     └── Recipe Detail
│            │
│            ├── Cook
│            │      ▼
│            │   Cooking Mode
│            │
│            ├── Edit
│            │      ▼
│            │   Recipe Editor
│            │
│            └── Add to Shopping List
│                   ▼
│              Shopping List
│
Shopping
│
├── Shopping List
│     │
│     └── Add Manual Item
│             ▼
│       Shopping Item
│
Settings
│
├── Household
│     │
│     └── Invite Member
│             ▼
│          Invite Link
│
├── Profile
│     │
│     └── Log Out
│
└── App Settings
```

---

# Core Domain Model

```text
Account
│
├── Profile
├── Credentials
└── Household Membership (one)
    │
    └── Household
        │
        ├── Members
        ├── Invites
        │
        ├── Recipes
        │   │
        │   ├── Recipe
        │   │   ├── Title
        │   │   ├── Ingredients
        │   │   ├── Steps
        │   │   └── Nutrition (future)
        │   │
        │   └── Favorites
        │
        └── Shopping List
            │
            ├── Shopping Item
            │   ├── Name
            │   ├── Quantity
            │   ├── Unit
            │   ├── Source Recipe(s)
            │   ├── Checked
            │   └── Manual Flag
            │
            └── Manual Items
```

---

# Future Extensions (No IA Changes Required)

```text
Recipes
├── Recipe Import
├── OCR Scanning
├── Nutrition Database
├── Categories
└── Tags

Shopping
├── Purchase History
└── Smart Sorting

Settings
└── Integrations
```

---

## Design Principles

* **Recipes are the central object.**
* **Cooking is a mode, not a navigation destination.**
* **Shopping List is a single persistent household resource.**
* **Macros are metadata attached to recipes, not a separate feature.**
* **Household owns all shared data and acts as the single source of truth.**
* **Authentication establishes an individual account before household data is available.**
* **An account creates or joins one household during onboarding.**

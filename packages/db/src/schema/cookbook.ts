import type { Ingredient } from "@monobara/contract";
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const households = pgTable("households", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  inviteCode: text("invite_code").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const householdMembers = pgTable(
  "household_members",
  {
    id: uuid("id").primaryKey(),
    householdId: uuid("household_id")
      .notNull()
      .references(() => households.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [uniqueIndex("one_household_per_user").on(table.userId)],
);

export const recipes = pgTable("recipes", {
  id: uuid("id").primaryKey(),
  householdId: uuid("household_id")
    .notNull()
    .references(() => households.id, { onDelete: "cascade" }),
  createdBy: text("created_by")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  prepMinutes: integer("prep_minutes").notNull().default(0),
  cookMinutes: integer("cook_minutes").notNull().default(0),
  servings: integer("servings").notNull().default(2),
  favorite: boolean("favorite").notNull().default(false),
  ingredients: jsonb("ingredients").$type<Ingredient[]>().notNull(),
  steps: jsonb("steps").$type<string[]>().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const shoppingItems = pgTable("shopping_items", {
  id: uuid("id").primaryKey(),
  householdId: uuid("household_id")
    .notNull()
    .references(() => households.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  amount: text("amount").notNull().default(""),
  done: boolean("done").notNull().default(false),
  source: text("source"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

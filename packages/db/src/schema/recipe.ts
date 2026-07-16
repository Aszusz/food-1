import {
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { household } from "./household";

export const recipe = pgTable("recipe", {
  id: uuid("id").primaryKey(),
  householdId: uuid("household_id")
    .notNull()
    .references(() => household.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const recipeIngredient = pgTable("recipe_ingredient", {
  id: uuid("id").primaryKey(),
  recipeId: uuid("recipe_id")
    .notNull()
    .references(() => recipe.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  quantity: numeric("quantity").notNull(),
  unit: text("unit").notNull(),
  note: text("note").notNull().default(""),
  position: integer("position").notNull(),
});

export const recipeStep = pgTable("recipe_step", {
  id: uuid("id").primaryKey(),
  recipeId: uuid("recipe_id")
    .notNull()
    .references(() => recipe.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  position: integer("position").notNull(),
});

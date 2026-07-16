import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";

// Kept in the schema so existing template databases migrate without guessing a table rename.
export const todos = pgTable("todos", {
  id: uuid("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  done: boolean("done").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

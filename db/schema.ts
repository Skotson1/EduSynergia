import { pgTable, text, jsonb, timestamp } from "drizzle-orm/pg-core";

// Each journal collection (users, grades, attendance, ...) is stored as one JSON document,
// shared by every device that logs in to the school's journal.
export const journalState = pgTable("journal_state", {
  key: text().primaryKey(),
  data: jsonb().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  token: text().primaryKey(),
  userId: text("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

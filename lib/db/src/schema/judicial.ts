import { pgTable, serial, text, integer, numeric, timestamp } from "drizzle-orm/pg-core";

export const stateStatsTable = pgTable("state_stats", {
  id: serial("id").primaryKey(),
  stateCode: text("state_code").notNull().unique(),
  stateName: text("state_name").notNull(),
  pendingCases: integer("pending_cases").notNull().default(0),
  activeCases: integer("active_cases").notNull().default(0),
  registeredThisWeek: integer("registered_this_week").notNull().default(0),
  disposedThisWeek: integer("disposed_this_week").notNull().default(0),
  totalCourts: integer("total_courts").notNull().default(0),
  disposalRate: numeric("disposal_rate", { precision: 5, scale: 2 }).notNull().default("0"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const districtStatsTable = pgTable("district_stats", {
  id: serial("id").primaryKey(),
  stateCode: text("state_code").notNull(),
  districtName: text("district_name").notNull(),
  pendingCases: integer("pending_cases").notNull().default(0),
  activeCases: integer("active_cases").notNull().default(0),
  registeredThisWeek: integer("registered_this_week").notNull().default(0),
  disposedThisWeek: integer("disposed_this_week").notNull().default(0),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const monthlyTrendsTable = pgTable("monthly_trends", {
  id: serial("id").primaryKey(),
  stateCode: text("state_code"), // null = national
  month: text("month").notNull(),
  filed: integer("filed").notNull().default(0),
  disposed: integer("disposed").notNull().default(0),
  pending: integer("pending").notNull().default(0),
});

export const courtTypeStatsTable = pgTable("court_type_stats", {
  id: serial("id").primaryKey(),
  courtType: text("court_type").notNull(),
  pendingCases: integer("pending_cases").notNull().default(0),
  activeCases: integer("active_cases").notNull().default(0),
  totalCourts: integer("total_courts").notNull().default(0),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const caseCategoryStatsTable = pgTable("case_category_stats", {
  id: serial("id").primaryKey(),
  stateCode: text("state_code"), // null = national
  category: text("category").notNull(),
  count: integer("count").notNull().default(0),
  percentage: numeric("percentage", { precision: 5, scale: 2 }).notNull().default("0"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type StateStats = typeof stateStatsTable.$inferSelect;
export type DistrictStats = typeof districtStatsTable.$inferSelect;
export type MonthlyTrend = typeof monthlyTrendsTable.$inferSelect;
export type CourtTypeStats = typeof courtTypeStatsTable.$inferSelect;
export type CaseCategoryStats = typeof caseCategoryStatsTable.$inferSelect;

import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const dataCenters = sqliteTable("data_centers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  company: text("company").notNull(),
  companyType: text("company_type").notNull(), // "hyperscale" | "colocation" | "neocloud"
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  country: text("country").notNull().default("USA"),
  capacityMW: real("capacity_mw"),
  estimatedAnnualGWh: real("estimated_annual_gwh"),
  waterUsageMillionGallons: real("water_usage_million_gallons"),
  status: text("status").notNull(), // "operational" | "under_construction" | "planned" | "canceled"
  yearOpened: integer("year_opened"),
  yearPlanned: integer("year_planned"),
  investmentBillions: real("investment_billions"),
  acreage: real("acreage"),
  primaryModels: text("primary_models"), // JSON array
  communityImpact: text("community_impact"),
  communityResistance: integer("community_resistance").default(0), // 0/1 boolean
  gridRisk: text("grid_risk"), // "low" | "medium" | "high"
  renewablePercent: integer("renewable_percent"),
  notes: text("notes"),
});

export const insertDataCenterSchema = createInsertSchema(dataCenters).omit({ id: true });
export type InsertDataCenter = z.infer<typeof insertDataCenterSchema>;
export type DataCenter = typeof dataCenters.$inferSelect;

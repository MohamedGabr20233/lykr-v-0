import {
  pgTable,
  bigint,
  varchar,
  text,
  timestamp,
  pgEnum,
  json,
  bigserial,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const campaignStatusEnum = pgEnum("campaign_status", [
  "draft",
  "active",
  "paused",
  "completed",
]);

export const leadSourceEnum = pgEnum("lead_source", [
  "apollo",
  "linkedin",
  "manual",
]);

// Users Table
export const users = pgTable("users", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 150 }).unique().notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  resetToken: varchar("reset_token", { length: 255 }),
  otpCode: varchar("otp_code", { length: 10 }),
  otpExpiresAt: timestamp("otp_expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Records Table
export const records = pgTable("records", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  userId: bigint("user_id", { mode: "bigint" })
    .references(() => users.id)
    .notNull(),
  questionText: text("question_text").notNull(),
  transcriptText: text("transcript_text").notNull(),
  audioUrl: varchar("audio_url", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ICPs Table
export const icps = pgTable("icps", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  userId: bigint("user_id", { mode: "bigint" })
    .references(() => users.id)
    .notNull(),
  companyIndustry: varchar("company_industry", { length: 255 }).notNull(),
  companySize: varchar("company_size", { length: 100 }).notNull(),
  targetRole: varchar("target_role", { length: 255 }).notNull(),
  painPoints: json("pain_points").$type<string[]>().notNull(),
  values: json("values").$type<string[]>().notNull(),
  goals: json("goals").$type<string[]>().notNull(),
  generatedAt: timestamp("generated_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Campaigns Table
export const campaigns = pgTable("campaigns", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  userId: bigint("user_id", { mode: "bigint" })
    .references(() => users.id)
    .notNull(),
  campaignName: varchar("campaign_name", { length: 255 }).notNull(),
  linkedinEmail: varchar("linkedin_email", { length: 255 }).notNull(),
  linkedinPassword: varchar("linkedin_password", { length: 255 }).notNull(),
  heyreachCampaignId: varchar("heyreach_campaign_id", { length: 255 }),
  status: campaignStatusEnum("status").default("draft").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Companies Table
export const companies = pgTable("companies", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  userId: bigint("user_id", { mode: "bigint" })
    .references(() => users.id)
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  domain: varchar("domain", { length: 255 }).notNull(),
  industry: varchar("industry", { length: 255 }),
  size: varchar("size", { length: 120 }),
  linkedinUrl: varchar("linkedin_url", { length: 500 }),
  country: varchar("country", { length: 120 }),
  city: varchar("city", { length: 120 }),
  rawData: json("raw_data").$type<Record<string, unknown>>().notNull(),
  lastRefreshedAt: timestamp("last_refreshed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Leads Table
export const leads = pgTable("leads", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  userId: bigint("user_id", { mode: "bigint" })
    .references(() => users.id)
    .notNull(),
  companyId: bigint("company_id", { mode: "bigint" })
    .references(() => companies.id)
    .notNull(),
  source: leadSourceEnum("source").notNull(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  linkedinUrl: varchar("linkedin_url", { length: 500 }),
  phone: varchar("phone", { length: 100 }),
  country: varchar("country", { length: 120 }),
  city: varchar("city", { length: 120 }),
  rawData: json("raw_data").$type<Record<string, unknown>>().notNull(),
  lastRefreshedAt: timestamp("last_refreshed_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  records: many(records),
  icps: many(icps),
  campaigns: many(campaigns),
  companies: many(companies),
  leads: many(leads),
}));

export const recordsRelations = relations(records, ({ one }) => ({
  user: one(users, {
    fields: [records.userId],
    references: [users.id],
  }),
}));

export const icpsRelations = relations(icps, ({ one }) => ({
  user: one(users, {
    fields: [icps.userId],
    references: [users.id],
  }),
}));

export const campaignsRelations = relations(campaigns, ({ one }) => ({
  user: one(users, {
    fields: [campaigns.userId],
    references: [users.id],
  }),
}));

export const companiesRelations = relations(companies, ({ one, many }) => ({
  user: one(users, {
    fields: [companies.userId],
    references: [users.id],
  }),
  leads: many(leads),
}));

export const leadsRelations = relations(leads, ({ one }) => ({
  user: one(users, {
    fields: [leads.userId],
    references: [users.id],
  }),
  company: one(companies, {
    fields: [leads.companyId],
    references: [companies.id],
  }),
}));

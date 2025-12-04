import { z } from "zod";

// Enums
export const campaignStatusSchema = z.enum([
  "draft",
  "active",
  "paused",
  "completed",
]);

export const leadSourceSchema = z.enum(["apollo", "linkedin", "manual"]);

// Users Schema
export const userSchema = z.object({
  id: z.bigint(),
  name: z.string().min(1).max(120),
  email: z.string().email().max(150),
  password: z.string().min(8).max(255),
  resetToken: z.string().max(255).nullable(),
  otpCode: z.string().max(10).nullable(),
  otpExpiresAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertUserSchema = userSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateUserSchema = insertUserSchema.partial();

// Records Schema
export const recordSchema = z.object({
  id: z.bigint(),
  userId: z.bigint(),
  questionText: z.string().min(1),
  transcriptText: z.string().min(1),
  audioUrl: z.string().url().max(500).nullable(),
  createdAt: z.date(),
});

export const insertRecordSchema = recordSchema.omit({
  id: true,
  createdAt: true,
});

export const updateRecordSchema = insertRecordSchema.partial();

// ICPs Schema
export const icpSchema = z.object({
  id: z.bigint(),
  userId: z.bigint(),
  companyIndustry: z.string().min(1).max(255),
  companySize: z.string().min(1).max(100),
  targetRole: z.string().min(1).max(255),
  painPoints: z.array(z.string()),
  values: z.array(z.string()),
  goals: z.array(z.string()),
  generatedAt: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertIcpSchema = icpSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateIcpSchema = insertIcpSchema.partial();

// Campaigns Schema
export const campaignSchema = z.object({
  id: z.bigint(),
  userId: z.bigint(),
  campaignName: z.string().min(1).max(255),
  linkedinEmail: z.string().email().max(255),
  linkedinPassword: z.string().min(1).max(255),
  heyreachCampaignId: z.string().max(255).nullable(),
  status: campaignStatusSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertCampaignSchema = campaignSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateCampaignSchema = insertCampaignSchema.partial();

// Companies Schema
export const companySchema = z.object({
  id: z.bigint(),
  userId: z.bigint(),
  name: z.string().min(1).max(255),
  domain: z.string().min(1).max(255),
  industry: z.string().max(255).nullable(),
  size: z.string().max(120).nullable(),
  linkedinUrl: z.string().url().max(500).nullable(),
  country: z.string().max(120).nullable(),
  city: z.string().max(120).nullable(),
  rawData: z.record(z.unknown()),
  lastRefreshedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertCompanySchema = companySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateCompanySchema = insertCompanySchema.partial();

// Leads Schema
export const leadSchema = z.object({
  id: z.bigint(),
  userId: z.bigint(),
  companyId: z.bigint(),
  source: leadSourceSchema,
  fullName: z.string().min(1).max(255),
  title: z.string().min(1).max(255),
  email: z.string().email().max(255).nullable(),
  linkedinUrl: z.string().url().max(500).nullable(),
  phone: z.string().max(100).nullable(),
  country: z.string().max(120).nullable(),
  city: z.string().max(120).nullable(),
  rawData: z.record(z.unknown()),
  lastRefreshedAt: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertLeadSchema = leadSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateLeadSchema = insertLeadSchema.partial();

// Inferred Types from Zod schemas
export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;

export type Record = z.infer<typeof recordSchema>;
export type InsertRecord = z.infer<typeof insertRecordSchema>;
export type UpdateRecord = z.infer<typeof updateRecordSchema>;

export type Icp = z.infer<typeof icpSchema>;
export type InsertIcp = z.infer<typeof insertIcpSchema>;
export type UpdateIcp = z.infer<typeof updateIcpSchema>;

export type Campaign = z.infer<typeof campaignSchema>;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type UpdateCampaign = z.infer<typeof updateCampaignSchema>;

export type Company = z.infer<typeof companySchema>;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type UpdateCompany = z.infer<typeof updateCompanySchema>;

export type Lead = z.infer<typeof leadSchema>;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type UpdateLead = z.infer<typeof updateLeadSchema>;

export type CampaignStatus = z.infer<typeof campaignStatusSchema>;
export type LeadSource = z.infer<typeof leadSourceSchema>;

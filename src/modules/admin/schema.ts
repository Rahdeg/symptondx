import { z } from "zod";

// Admin authentication schema
export const adminAuthSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// User management schemas
export const updateUserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Name is required").optional(),
  email: z.string().email("Invalid email format").optional(),
  role: z.enum(["patient", "doctor", "admin"]).optional(),
  isActive: z.boolean().optional(),
});

export const deleteUserSchema = z.object({
  id: z.string().uuid(),
});

// Doctor verification schemas
export const verifyDoctorSchema = z.object({
  doctorId: z.string().uuid(),
  isVerified: z.boolean(),
  notes: z.string().optional(),
});

export const getDoctorVerificationSchema = z.object({
  doctorId: z.string().uuid().optional(),
  status: z.enum(["pending", "verified", "rejected"]).optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

// System management schemas
export const systemStatsSchema = z.object({
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

export const bulkUserActionSchema = z.object({
  userIds: z
    .array(z.string().uuid())
    .min(1, "At least one user ID is required"),
  action: z.enum(["activate", "deactivate", "delete"]),
});

// Admin settings schema
export const adminSettingsSchema = z.object({
  adminPassword: z.string().min(6, "Password must be at least 6 characters"),
  systemMaintenanceMode: z.boolean().optional(),
  allowNewRegistrations: z.boolean().optional(),
  maxDailyDiagnoses: z.number().min(1).optional(),
});

// Admin creation schema
export const createAdminSchema = z.object({
  organizationName: z.string().min(2, "Organization name is required"),
  jobTitle: z.string().min(2, "Job title is required"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  department: z.string().optional(),
  managementLevel: z.enum(["senior", "mid", "junior", "executive"]),
  systemPermissions: z.array(z.string()).optional(),
  preferredNotifications: z.array(z.string()).optional(),
});

// Types
export type AdminAuthInput = z.infer<typeof adminAuthSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type DeleteUserInput = z.infer<typeof deleteUserSchema>;
export type VerifyDoctorInput = z.infer<typeof verifyDoctorSchema>;
export type GetDoctorVerificationInput = z.infer<
  typeof getDoctorVerificationSchema
>;
export type SystemStatsInput = z.infer<typeof systemStatsSchema>;
export type BulkUserActionInput = z.infer<typeof bulkUserActionSchema>;
export type AdminSettingsInput = z.infer<typeof adminSettingsSchema>;
export type CreateAdminInput = z.infer<typeof createAdminSchema>;

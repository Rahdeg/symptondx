import { z } from "zod";

export const onboardingStepSchema = z.object({
  role: z.enum(["patient", "doctor", "admin"]),
  step: z.number().min(1).max(5),
});

export const completeOnboardingSchema = z.object({
  role: z.enum(["patient", "doctor", "admin"]),
});

// Admin onboarding schema
export const adminOnboardingSchema = z.object({
  organizationName: z.string().min(2, "Organization name is required"),
  jobTitle: z.string().min(2, "Job title is required"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  department: z.string().optional(),
  managementLevel: z.enum(["senior", "mid", "junior", "executive"]),
  systemPermissions: z.array(z.string()).optional(),
  preferredNotifications: z.array(z.string()).optional(),
});

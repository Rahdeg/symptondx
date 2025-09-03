import { z } from "zod";

export const doctorOnboardingSchema = z.object({
  licenseNumber: z.string().min(5, "License number is required"),
  specialization: z.string().min(2, "Specialization is required"),
  yearsOfExperience: z
    .number()
    .min(0, "Years of experience must be 0 or greater"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  qualifications: z.string().min(10, "Please provide your qualifications"),
  hospitalAffiliations: z.string().optional(),
});

export const diagnosisReviewSchema = z.object({
  diagnosisSessionId: z.string().uuid(),
  doctorDiagnosis: z.string().min(1, "Doctor diagnosis is required"),
  confidence: z.number().min(0).max(1),
  recommendedTreatment: z.string().optional(),
  followUpRequired: z.boolean().default(false),
  notes: z.string().optional(),
});

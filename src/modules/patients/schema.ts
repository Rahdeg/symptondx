import { z } from "zod";

export const patientOnboardingSchema = z.object({
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"]),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(5, "Address is required"),
  emergencyContact: z.string().min(2, "Emergency contact name is required"),
  emergencyPhone: z.string().min(10, "Emergency phone number is required"),
  medicalHistory: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
  currentMedications: z.array(z.string()).optional(),
});

export const symptomInputSchema = z.object({
  symptoms: z.array(z.string()).min(1, "Please describe at least one symptom"),
  duration: z.string().min(1, "Please specify symptom duration"),
  severity: z.enum(["mild", "moderate", "severe"]),
  additionalNotes: z.string().optional(),
});

export const diagnosisSessionSchema = z.object({
  patientId: z.string().uuid(),
  symptoms: z.array(z.string()),
  duration: z.string(),
  severity: z.enum(["mild", "moderate", "severe"]),
  additionalNotes: z.string().optional(),
});

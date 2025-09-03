import { z } from "zod";

export const diagnosisRequestSchema = z.object({
  symptoms: z.array(z.string()).min(1, "At least one symptom is required"),
  duration: z.string().min(1, "Duration is required"),
  severity: z.enum(["mild", "moderate", "severe"]),
  additionalNotes: z.string().optional(),
  age: z.number().min(1).max(120),
  gender: z.enum(["male", "female", "other"]),
  predictionMethod: z.enum(["ai", "ml"]).default("ml"),
});

export const diagnosisResultSchema = z.object({
  possibleDiseases: z.array(
    z.object({
      name: z.string(),
      confidence: z.number(),
      description: z.string(),
      recommendedActions: z.array(z.string()),
    })
  ),
  urgencyLevel: z.enum(["low", "medium", "high", "emergency"]),
  recommendations: z.array(z.string()),
  sessionId: z.string().uuid(),
});

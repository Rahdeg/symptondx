import { z } from "zod";

export const mlModelSchema = z.object({
  name: z.string().min(1, "Model name is required"),
  version: z.string().min(1, "Version is required"),
  provider: z.enum(["openai", "anthropic", "gemini", "custom"]),
  modelType: z.enum(["gpt-3.5-turbo", "claude-3", "gemini-pro", "fine-tuned"]),
  accuracy: z.number().min(0).max(1),
  isActive: z.boolean().default(true),
});

export const predictionSchema = z.object({
  sessionId: z.string().uuid(),
  modelId: z.string().uuid(),
  inputData: z.record(z.string(), z.unknown()),
  prediction: z.record(z.string(), z.unknown()),
  confidence: z.number().min(0).max(1),
  processingTime: z.number().min(0),
});

export const trainingDataSchema = z.object({
  symptoms: z.array(z.string()),
  diagnosis: z.string(),
  confidence: z.number().min(0).max(1),
  source: z.enum(["manual", "doctor_review", "literature", "synthetic"]),
  verified: z.boolean().default(false),
});

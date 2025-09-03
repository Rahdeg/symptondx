import { z } from "zod";

export const onboardingStepSchema = z.object({
  role: z.enum(["patient", "doctor"]),
  step: z.number().min(1).max(5),
});

export const completeOnboardingSchema = z.object({
  role: z.enum(["patient", "doctor"]),
});

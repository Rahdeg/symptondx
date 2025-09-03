import { createTRPCRouter } from "../init";
import { authRouter } from "../../modules/auth/api/procedure";
import { patientsRouter } from "../../modules/patients/api/procedure";
import { doctorsRouter } from "../../modules/doctors/api/procedure";
import { onboardingRouter } from "../../modules/onboarding/api/procedure";
import { diagnosisRouter } from "../../modules/diagnosis/api/procedure";
import { mlRouter } from "../../modules/ml/api/procedure";
import { notificationsRouter } from "./notifications";
import { aiRouter } from "./ai";
import { symptomsRouter } from "./symptoms";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

export const appRouter = createTRPCRouter({
  // Module-based routers
  auth: authRouter,
  patients: patientsRouter,
  doctors: doctorsRouter,
  onboarding: onboardingRouter,
  diagnosis: diagnosisRouter,
  ml: mlRouter,

  // Utility routers
  notifications: notificationsRouter,
  ai: aiRouter,
  symptoms: symptomsRouter,
});

export type AppRouter = typeof appRouter;
export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;

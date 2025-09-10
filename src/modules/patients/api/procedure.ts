import { z } from "zod";
import { protectedProcedure, createTRPCRouter } from "@/trpc/init";
import { patientOnboardingSchema, symptomInputSchema } from "../schema";
import { userService } from "../../auth/services/user-service";
import { patientService } from "../services/patient-service";

export const patientsRouter = createTRPCRouter({
  // Create patient during onboarding
  createPatient: protectedProcedure
    .input(patientOnboardingSchema)
    .mutation(async ({ input, ctx }) => {
      return userService.createPatient(ctx.clerkUserId!, input);
    }),

  // Get patient dashboard stats
  getDashboardStats: protectedProcedure.query(async ({ ctx }) => {
    return patientService.getDashboardStats(ctx.clerkUserId!);
  }),

  // Get patient profile info
  getPatientProfile: protectedProcedure.query(async ({ ctx }) => {
    const profile = await patientService.getPatientProfile(ctx.clerkUserId!);
    return {
      ...profile.patient,
      name: profile.name,
      email: profile.email,
    };
  }),

  // Get patient diagnosis sessions
  getDiagnosisSessions: protectedProcedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(10),
        status: z
          .enum([
            "pending",
            "in_progress",
            "completed",
            "reviewed",
            "cancelled",
          ])
          .optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      return patientService.getDiagnosisSessions(ctx.clerkUserId!, input);
    }),

  // Start new diagnosis session
  startDiagnosisSession: protectedProcedure
    .input(symptomInputSchema)
    .mutation(async ({ ctx, input }) => {
      return patientService.startDiagnosisSession(ctx.clerkUserId!, input);
    }),

  // Update patient profile
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2).optional(),
        phoneNumber: z.string().min(7).optional(),
        address: z.string().min(2).optional(),
        medicalHistory: z.array(z.string()).optional(),
        currentMedications: z.array(z.string()).optional(),
        allergies: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return patientService.updateProfile(ctx.clerkUserId!, input);
    }),

  // Get pending doctor reviews for patient
  getPendingDoctorReviews: protectedProcedure.query(async ({ ctx }) => {
    const result = await patientService.getPendingDoctorReviews(
      ctx.clerkUserId!
    );
    return result.data;
  }),

  // Get doctor review history for patient
  getDoctorReviewHistory: protectedProcedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const result = await patientService.getDoctorReviewHistory(
        ctx.clerkUserId!,
        input
      );
      return result.data;
    }),

  // Get detailed case status for patient
  getCaseStatus: protectedProcedure
    .input(z.object({ sessionId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const result = await patientService.getCaseStatus(
        ctx.clerkUserId!,
        input.sessionId
      );
      return result.data;
    }),
});

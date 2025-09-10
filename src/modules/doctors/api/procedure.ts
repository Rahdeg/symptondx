import { z } from "zod";
import { db } from "@/db";
import { doctors, users, diagnosisSessions, patients } from "@/db/schema";
import {
  protectedProcedure,
  createTRPCRouter,
  doctorProcedure,
} from "@/trpc/init";
import { doctorOnboardingSchema, diagnosisReviewSchema } from "../schema";
import { doctorService } from "../services/doctor-service";
import { userService } from "../../auth/services/user-service";
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const doctorsRouter = createTRPCRouter({
  // Create doctor during onboarding
  createDoctor: protectedProcedure
    .input(doctorOnboardingSchema)
    .mutation(async ({ input, ctx }) => {
      return userService.createDoctor(ctx.clerkUserId!, input);
    }),

  // Get all available doctors for patient selection
  getAvailableDoctors: protectedProcedure
    .input(
      z.object({
        specialization: z.string().optional(),
        limit: z.number().default(20),
      })
    )
    .query(async ({ input }) => {
      const result = await doctorService.getAvailableDoctors(input);
      return result.data;
    }),

  // Get doctor specializations
  getSpecializations: protectedProcedure.query(async () => {
    const result = await doctorService.getSpecializations();
    return result.data;
  }),

  // Assign doctor to a diagnosis session
  assignDoctorToSession: doctorProcedure
    .input(
      z.object({
        sessionId: z.string().uuid(),
        doctorId: z.string().uuid(),
      })
    )
    .mutation(async ({ input }) => {
      return doctorService.assignDoctorToSession(
        input.sessionId,
        input.doctorId
      );
    }),

  // Get doctor dashboard stats
  getDashboardStats: doctorProcedure.query(async ({ ctx }) => {
    return doctorService.getDashboardStats(ctx.clerkUserId!);
  }),

  // Get doctor profile info
  getDoctorProfile: doctorProcedure.query(async ({ ctx }) => {
    const profile = await doctorService.getDoctorProfile(ctx.clerkUserId!);
    return {
      ...profile,
      ...profile.doctor,
      qualifications: profile.doctor.qualifications
        ? profile.doctor.qualifications.split(",").map((q) => q.trim())
        : [],
      hospitalAffiliations: profile.doctor.hospitalAffiliations
        ? profile.doctor.hospitalAffiliations.split(",").map((h) => h.trim())
        : [],
    };
  }),

  // Get assigned diagnosis sessions for review
  getAssignedSessions: doctorProcedure
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
      return doctorService.getAssignedSessions(ctx.clerkUserId!, input);
    }),

  // Submit diagnosis review
  submitDiagnosisReview: doctorProcedure
    .input(diagnosisReviewSchema)
    .mutation(async ({ ctx, input }) => {
      return doctorService.submitDiagnosisReview(ctx.clerkUserId!, input);
    }),

  // Update doctor profile
  updateProfile: doctorProcedure
    .input(
      z.object({
        name: z.string().min(2).optional(),
        specialization: z.string().optional(),
        phoneNumber: z.string().min(7).optional(),
        yearsOfExperience: z.number().min(0).max(70).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return doctorService.updateProfile(ctx.clerkUserId!, input);
    }),

  // Get urgent cases for doctor dashboard
  getUrgentCases: doctorProcedure.query(async ({ ctx }) => {
    const result = await doctorService.getUrgentCases(ctx.clerkUserId!);
    return result.data;
  }),

  // Get case preview for doctor dashboard
  getCasePreview: doctorProcedure
    .input(z.object({ sessionId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [doctorData] = await db
        .select({ doctorId: doctors.id })
        .from(users)
        .innerJoin(doctors, eq(users.id, doctors.userId))
        .where(eq(users.clerkId, ctx.clerkUserId!))
        .limit(1);

      if (!doctorData) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Doctor not found",
        });
      }

      const casePreview = await db
        .select({
          id: diagnosisSessions.id,
          chiefComplaint: diagnosisSessions.chiefComplaint,
          additionalInfo: diagnosisSessions.additionalInfo,
          status: diagnosisSessions.status,
          urgencyLevel: diagnosisSessions.urgencyLevel,
          isEmergency: diagnosisSessions.isEmergency,
          createdAt: diagnosisSessions.createdAt,
          patientName: users.name,
          patientAge: patients.dateOfBirth,
          patientGender: patients.gender,
          patientMedicalHistory: patients.medicalHistory,
          patientCurrentMedications: patients.currentMedications,
        })
        .from(diagnosisSessions)
        .leftJoin(patients, eq(diagnosisSessions.patientId, patients.id))
        .leftJoin(users, eq(patients.userId, users.id))
        .where(
          and(
            eq(diagnosisSessions.id, input.sessionId),
            eq(diagnosisSessions.doctorId, doctorData.doctorId)
          )
        )
        .limit(1);

      if (!casePreview.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Case not found",
        });
      }

      return casePreview[0];
    }),

  // Update case status with notes
  updateCaseStatus: doctorProcedure
    .input(
      z.object({
        sessionId: z.string().uuid(),
        status: z.enum([
          "pending",
          "in_progress",
          "completed",
          "reviewed",
          "cancelled",
        ]),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [doctorData] = await db
        .select({ doctorId: doctors.id })
        .from(users)
        .innerJoin(doctors, eq(users.id, doctors.userId))
        .where(eq(users.clerkId, ctx.clerkUserId!))
        .limit(1);

      if (!doctorData) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Doctor not found",
        });
      }

      const updateData: {
        status:
          | "pending"
          | "in_progress"
          | "completed"
          | "reviewed"
          | "cancelled";
        updatedAt: Date;
        doctorNotes?: string;
        completedAt?: Date;
      } = {
        status: input.status,
        updatedAt: new Date(),
      };

      if (input.notes) {
        updateData.doctorNotes = input.notes;
      }

      if (input.status === "reviewed" || input.status === "completed") {
        updateData.completedAt = new Date();
      }

      const updatedCase = await db
        .update(diagnosisSessions)
        .set(updateData)
        .where(
          and(
            eq(diagnosisSessions.id, input.sessionId),
            eq(diagnosisSessions.doctorId, doctorData.doctorId)
          )
        )
        .returning();

      return updatedCase[0];
    }),

  // Get review metrics for doctor
  getReviewMetrics: doctorProcedure
    .input(
      z.object({
        period: z.enum(["today", "week", "month"]).default("week"),
      })
    )
    .query(async ({ ctx, input }) => {
      return doctorService.getReviewMetrics(ctx.clerkUserId!, input.period);
    }),
});

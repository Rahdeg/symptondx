import { z } from "zod";
import { db } from "@/db";
import { doctors, users, diagnosisSessions, doctorReviews } from "@/db/schema";
import {
  protectedProcedure,
  createTRPCRouter,
  doctorProcedure,
} from "@/trpc/init";
import { doctorOnboardingSchema, diagnosisReviewSchema } from "../schema";
import { eq, desc, and, count } from "drizzle-orm";
import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";

export const doctorsRouter = createTRPCRouter({
  // Create doctor during onboarding
  createDoctor: protectedProcedure
    .input(doctorOnboardingSchema)
    .mutation(async ({ input, ctx }) => {
      // Get the current user's ID from the database
      const currentUser = await db
        .select({ id: users.id, onboardingComplete: users.onboardingComplete })
        .from(users)
        .where(eq(users.clerkId, ctx.clerkUserId!))
        .limit(1);

      if (!currentUser.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Check if doctor already exists to prevent duplicates
      const existingDoctor = await db
        .select({ id: doctors.id })
        .from(doctors)
        .where(eq(doctors.userId, currentUser[0].id))
        .limit(1);

      if (existingDoctor.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Doctor profile already exists for this user",
        });
      }

      // Check if user has already completed onboarding
      if (currentUser[0].onboardingComplete) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User has already completed onboarding",
        });
      }

      const doctor = await db
        .insert(doctors)
        .values({
          userId: currentUser[0].id,
          licenseNumber: input.licenseNumber,
          specialization: input.specialization,
          yearsOfExperience: input.yearsOfExperience,
          phoneNumber: input.phoneNumber,
          qualifications: input.qualifications,
          hospitalAffiliations: input.hospitalAffiliations,
          isVerified: false, // Requires manual verification
        })
        .returning();

      // Update the user's onboarding status
      await db
        .update(users)
        .set({
          onboardingComplete: true,
          role: "doctor",
        })
        .where(eq(users.clerkId, ctx.clerkUserId!));

      // Update Clerk metadata
      const clerk = await clerkClient();
      await clerk.users.updateUser(ctx.clerkUserId!, {
        publicMetadata: {
          onboardingComplete: true,
          role: "doctor",
        },
      });

      return doctor[0];
    }),

  // Get doctor dashboard stats
  getDashboardStats: doctorProcedure.query(async ({ ctx }) => {
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

    const doctorId = doctorData.doctorId;

    // Get total assigned sessions
    const [sessionCount] = await db
      .select({ count: count() })
      .from(diagnosisSessions)
      .where(eq(diagnosisSessions.doctorId, doctorId));

    // Get pending reviews
    const [pendingCount] = await db
      .select({ count: count() })
      .from(diagnosisSessions)
      .where(
        and(
          eq(diagnosisSessions.doctorId, doctorId),
          eq(diagnosisSessions.status, "in_progress")
        )
      );

    // Get completed reviews
    const [completedCount] = await db
      .select({ count: count() })
      .from(doctorReviews)
      .where(eq(doctorReviews.doctorId, doctorId));

    return {
      totalSessions: sessionCount.count,
      pendingReviews: pendingCount.count,
      completedReviews: completedCount.count,
    };
  }),

  // Get doctor profile info
  getDoctorProfile: doctorProcedure.query(async ({ ctx }) => {
    const [doctorData] = await db
      .select({
        id: doctors.id,
        name: users.name,
        email: users.email,
        licenseNumber: doctors.licenseNumber,
        specialization: doctors.specialization,
        yearsOfExperience: doctors.yearsOfExperience,
        phoneNumber: doctors.phoneNumber,
        isVerified: doctors.isVerified,
        createdAt: doctors.createdAt,
      })
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

    return doctorData;
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

      const offset = (input.page - 1) * input.limit;
      const conditions = [eq(diagnosisSessions.doctorId, doctorData.doctorId)];

      if (input.status) {
        conditions.push(eq(diagnosisSessions.status, input.status));
      }

      const whereCondition =
        conditions.length > 1 ? and(...conditions) : conditions[0];

      const sessionsList = await db
        .select({
          id: diagnosisSessions.id,
          chiefComplaint: diagnosisSessions.chiefComplaint,
          additionalInfo: diagnosisSessions.additionalInfo,
          status: diagnosisSessions.status,
          finalDiagnosis: diagnosisSessions.finalDiagnosis,
          confidence_score: diagnosisSessions.confidence_score,
          urgencyLevel: diagnosisSessions.urgencyLevel,
          isEmergency: diagnosisSessions.isEmergency,
          requiresDoctorReview: diagnosisSessions.requiresDoctorReview,
          createdAt: diagnosisSessions.createdAt,
        })
        .from(diagnosisSessions)
        .where(whereCondition)
        .orderBy(desc(diagnosisSessions.createdAt))
        .limit(input.limit)
        .offset(offset);

      const [totalCount] = await db
        .select({ count: count() })
        .from(diagnosisSessions)
        .where(whereCondition);

      return {
        sessions: sessionsList,
        totalCount: totalCount.count,
        totalPages: Math.ceil(totalCount.count / input.limit),
        currentPage: input.page,
      };
    }),

  // Submit diagnosis review
  submitDiagnosisReview: doctorProcedure
    .input(diagnosisReviewSchema)
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

      // Create doctor review
      const review = await db
        .insert(doctorReviews)
        .values({
          sessionId: input.diagnosisSessionId,
          doctorId: doctorData.doctorId,
          finalDiagnosis: input.doctorDiagnosis,
          confidence: Math.floor(input.confidence * 10), // Convert to 1-10 scale
          notes: input.notes,
          agreesWithML: true, // We'll determine this based on confidence
          recommendedActions: input.recommendedTreatment
            ? [input.recommendedTreatment]
            : [],
        })
        .returning();

      // Update the diagnosis session
      await db
        .update(diagnosisSessions)
        .set({
          status: "reviewed",
          finalDiagnosis: input.doctorDiagnosis,
          doctorNotes: input.notes,
          confidence_score: input.confidence.toString(),
          completedAt: new Date(),
        })
        .where(eq(diagnosisSessions.id, input.diagnosisSessionId));

      return review[0];
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

      // Update user name if provided
      if (input.name) {
        await db
          .update(users)
          .set({ name: input.name })
          .where(eq(users.clerkId, ctx.clerkUserId!));
      }

      // Update doctor fields
      const doctorUpdate: Record<string, unknown> = {};
      if (input.specialization)
        doctorUpdate.specialization = input.specialization;
      if (input.phoneNumber) doctorUpdate.phoneNumber = input.phoneNumber;
      if (input.yearsOfExperience !== undefined)
        doctorUpdate.yearsOfExperience = input.yearsOfExperience;

      if (Object.keys(doctorUpdate).length > 0) {
        doctorUpdate.updatedAt = new Date();

        const [updatedDoctor] = await db
          .update(doctors)
          .set(doctorUpdate)
          .where(eq(doctors.id, doctorData.doctorId))
          .returning();

        return updatedDoctor;
      }

      return null;
    }),
});

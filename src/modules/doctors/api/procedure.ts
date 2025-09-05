import { z } from "zod";
import { db } from "@/db";
import {
  doctors,
  users,
  diagnosisSessions,
  doctorReviews,
  notifications,
  patients,
} from "@/db/schema";
import {
  protectedProcedure,
  createTRPCRouter,
  doctorProcedure,
} from "@/trpc/init";
import { doctorOnboardingSchema, diagnosisReviewSchema } from "../schema";
import { eq, desc, and, count, gte } from "drizzle-orm";
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

  // Get all available doctors for patient selection
  getAvailableDoctors: protectedProcedure
    .input(
      z.object({
        specialization: z.string().optional(),
        limit: z.number().default(20),
      })
    )
    .query(async ({ input }) => {
      const conditions = [eq(doctors.isVerified, true)];

      if (input.specialization) {
        conditions.push(eq(doctors.specialization, input.specialization));
      }

      const whereCondition =
        conditions.length > 1 ? and(...conditions) : conditions[0];

      const availableDoctors = await db
        .select({
          id: doctors.id,
          licenseNumber: doctors.licenseNumber,
          specialization: doctors.specialization,
          yearsOfExperience: doctors.yearsOfExperience,
          qualifications: doctors.qualifications,
          hospitalAffiliations: doctors.hospitalAffiliations,
          name: users.name,
          email: users.email,
        })
        .from(doctors)
        .innerJoin(users, eq(doctors.userId, users.id))
        .where(whereCondition)
        .limit(input.limit);

      return availableDoctors;
    }),

  // Get doctor specializations
  getSpecializations: protectedProcedure.query(async () => {
    const specializations = await db
      .selectDistinct({ specialization: doctors.specialization })
      .from(doctors)
      .where(eq(doctors.isVerified, true));

    return specializations
      .map((s) => s.specialization)
      .filter(Boolean)
      .sort();
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
      // Verify the doctor exists and is verified
      const [doctorData] = await db
        .select({ id: doctors.id, isVerified: doctors.isVerified })
        .from(doctors)
        .where(eq(doctors.id, input.doctorId))
        .limit(1);

      if (!doctorData || !doctorData.isVerified) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Doctor not found or not verified",
        });
      }

      // Update the diagnosis session with the selected doctor
      const [updatedSession] = await db
        .update(diagnosisSessions)
        .set({
          doctorId: input.doctorId,
          status: "pending", // Change status to pending for doctor review
          requiresDoctorReview: true,
        })
        .where(eq(diagnosisSessions.id, input.sessionId))
        .returning();

      // Get doctor's user ID for notification
      const [doctorUser] = await db
        .select({ userId: users.id })
        .from(doctors)
        .innerJoin(users, eq(doctors.userId, users.id))
        .where(eq(doctors.id, input.doctorId))
        .limit(1);

      // Create notification for the doctor
      if (doctorUser) {
        await db.insert(notifications).values({
          userId: doctorUser.userId,
          type: "doctor_review_needed",
          title: "New Case Assignment",
          message: "You have been assigned a new diagnosis case for review",
          data: {
            sessionId: input.sessionId,
            patientId: updatedSession.patientId,
          },
        });
      }

      return updatedSession;
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
        qualifications: doctors.qualifications,
        hospitalAffiliations: doctors.hospitalAffiliations,
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

    return {
      ...doctorData,
      qualifications: doctorData.qualifications
        ? doctorData.qualifications.split(",").map((q) => q.trim())
        : [],
      hospitalAffiliations: doctorData.hospitalAffiliations
        ? doctorData.hospitalAffiliations.split(",").map((h) => h.trim())
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

  // Get urgent cases for doctor dashboard
  getUrgentCases: doctorProcedure.query(async ({ ctx }) => {
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

    const urgentCases = await db
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
      })
      .from(diagnosisSessions)
      .leftJoin(patients, eq(diagnosisSessions.patientId, patients.id))
      .leftJoin(users, eq(patients.userId, users.id))
      .where(
        and(
          eq(diagnosisSessions.doctorId, doctorData.doctorId),
          eq(diagnosisSessions.status, "pending")
        )
      )
      .orderBy(
        desc(diagnosisSessions.isEmergency),
        desc(diagnosisSessions.urgencyLevel),
        desc(diagnosisSessions.createdAt)
      )
      .limit(10);

    return urgentCases;
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

      // Calculate date range based on period
      const now = new Date();
      let startDate: Date;

      switch (input.period) {
        case "today":
          startDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          );
          break;
        case "week":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "month":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      }

      const metrics = await db
        .select({
          totalCases: count(diagnosisSessions.id),
          completedReviews: count(doctorReviews.id),
        })
        .from(diagnosisSessions)
        .leftJoin(
          doctorReviews,
          eq(diagnosisSessions.id, doctorReviews.sessionId)
        )
        .where(
          and(
            eq(diagnosisSessions.doctorId, doctorData.doctorId),
            gte(diagnosisSessions.createdAt, startDate)
          )
        );

      return {
        totalCases: metrics[0]?.totalCases || 0,
        completedReviews: metrics[0]?.completedReviews || 0,
        pendingReviews:
          (metrics[0]?.totalCases || 0) - (metrics[0]?.completedReviews || 0),
        completionRate: metrics[0]?.totalCases
          ? ((metrics[0]?.completedReviews || 0) / metrics[0]?.totalCases) * 100
          : 0,
      };
    }),
});

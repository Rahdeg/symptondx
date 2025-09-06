import { z } from "zod";
import { db } from "@/db";
import {
  patients,
  users,
  diagnosisSessions,
  doctors,
  doctorReviews,
} from "@/db/schema";
import { protectedProcedure, createTRPCRouter } from "@/trpc/init";
import { patientOnboardingSchema, symptomInputSchema } from "../schema";
import { eq, desc, and, count } from "drizzle-orm";
import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";

export const patientsRouter = createTRPCRouter({
  // Create patient during onboarding
  createPatient: protectedProcedure
    .input(patientOnboardingSchema)
    .mutation(async ({ input, ctx }) => {
      // Get the current user's ID from the database
      const currentUser = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          onboardingComplete: users.onboardingComplete,
        })
        .from(users)
        .where(eq(users.clerkId, ctx.clerkUserId!))
        .limit(1);

      if (!currentUser.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Check if patient already exists to prevent duplicates
      const existingPatient = await db
        .select({ id: patients.id })
        .from(patients)
        .where(eq(patients.userId, currentUser[0].id))
        .limit(1);

      if (existingPatient.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Patient profile already exists for this user",
        });
      }

      // Check if user has already completed onboarding
      if (currentUser[0].onboardingComplete) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User has already completed onboarding",
        });
      }

      const patient = await db
        .insert(patients)
        .values({
          userId: currentUser[0].id,
          dateOfBirth: new Date(input.dateOfBirth),
          gender: input.gender,
          phoneNumber: input.phoneNumber,
          address: input.address,
          emergencyContact: input.emergencyContact,
          emergencyPhone: input.emergencyPhone,
          medicalHistory: input.medicalHistory || [],
          currentMedications: input.currentMedications || [],
          allergies: input.allergies || [],
        })
        .returning();

      // Update the user's onboarding status
      await db
        .update(users)
        .set({
          onboardingComplete: true,
          role: "patient",
        })
        .where(eq(users.clerkId, ctx.clerkUserId!));

      // Update Clerk metadata
      const clerk = await clerkClient();
      await clerk.users.updateUserMetadata(ctx.clerkUserId!, {
        publicMetadata: {
          onboardingComplete: true,
          role: "patient",
        },
      });

      return patient[0];
    }),

  // Get patient dashboard stats
  getDashboardStats: protectedProcedure.query(async ({ ctx }) => {
    const [patientData] = await db
      .select({ patientId: patients.id })
      .from(users)
      .innerJoin(patients, eq(users.id, patients.userId))
      .where(eq(users.clerkId, ctx.clerkUserId!))
      .limit(1);

    if (!patientData) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Patient not found",
      });
    }

    const patientId = patientData.patientId;

    // Get total diagnosis sessions
    const [sessionCount] = await db
      .select({ count: count() })
      .from(diagnosisSessions)
      .where(eq(diagnosisSessions.patientId, patientId));

    // Get completed sessions
    const [completedCount] = await db
      .select({ count: count() })
      .from(diagnosisSessions)
      .where(
        and(
          eq(diagnosisSessions.patientId, patientId),
          eq(diagnosisSessions.status, "completed")
        )
      );

    // Get pending doctor reviews - sessions that have a doctor assigned but haven't been reviewed yet
    const [reviewCount] = await db
      .select({ count: count() })
      .from(diagnosisSessions)
      .where(
        and(
          eq(diagnosisSessions.patientId, patientId),
          eq(diagnosisSessions.status, "pending"),
          eq(diagnosisSessions.requiresDoctorReview, true)
        )
      );

    return {
      totalSessions: sessionCount.count,
      completedSessions: completedCount.count,
      pendingReviews: reviewCount.count,
    };
  }),

  // Get patient profile info
  getPatientProfile: protectedProcedure.query(async ({ ctx }) => {
    const [patientData] = await db
      .select({
        id: patients.id,
        name: users.name,
        email: users.email,
        phoneNumber: patients.phoneNumber,
        address: patients.address,
        dateOfBirth: patients.dateOfBirth,
        gender: patients.gender,
        medicalHistory: patients.medicalHistory,
        currentMedications: patients.currentMedications,
        allergies: patients.allergies,
        emergencyContact: patients.emergencyContact,
        emergencyPhone: patients.emergencyPhone,
        createdAt: patients.createdAt,
      })
      .from(users)
      .innerJoin(patients, eq(users.id, patients.userId))
      .where(eq(users.clerkId, ctx.clerkUserId!))
      .limit(1);

    if (!patientData) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Patient not found",
      });
    }

    return patientData;
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
      const [patientData] = await db
        .select({ patientId: patients.id })
        .from(users)
        .innerJoin(patients, eq(users.id, patients.userId))
        .where(eq(users.clerkId, ctx.clerkUserId!))
        .limit(1);

      if (!patientData) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Patient not found",
        });
      }

      const offset = (input.page - 1) * input.limit;
      const conditions = [
        eq(diagnosisSessions.patientId, patientData.patientId),
      ];

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

  // Start new diagnosis session
  startDiagnosisSession: protectedProcedure
    .input(symptomInputSchema)
    .mutation(async ({ ctx, input }) => {
      const [patientData] = await db
        .select({ patientId: patients.id })
        .from(users)
        .innerJoin(patients, eq(users.id, patients.userId))
        .where(eq(users.clerkId, ctx.clerkUserId!))
        .limit(1);

      if (!patientData) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Patient not found",
        });
      }

      const session = await db
        .insert(diagnosisSessions)
        .values({
          patientId: patientData.patientId,
          chiefComplaint: input.symptoms.join(", "),
          additionalInfo: `Duration: ${input.duration}, Severity: ${
            input.severity
          }${input.additionalNotes ? `, Notes: ${input.additionalNotes}` : ""}`,
          status: "pending",
          urgencyLevel: input.severity === "severe" ? "high" : "medium",
        })
        .returning();

      return session[0];
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
      const [patientData] = await db
        .select({ patientId: patients.id })
        .from(users)
        .innerJoin(patients, eq(users.id, patients.userId))
        .where(eq(users.clerkId, ctx.clerkUserId!))
        .limit(1);

      if (!patientData) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Patient not found",
        });
      }

      // Update user name if provided
      if (input.name) {
        await db
          .update(users)
          .set({ name: input.name })
          .where(eq(users.clerkId, ctx.clerkUserId!));
      }

      // Update patient fields
      const patientUpdate: Record<string, unknown> = {};
      if (input.phoneNumber) patientUpdate.phoneNumber = input.phoneNumber;
      if (input.address) patientUpdate.address = input.address;
      if (input.medicalHistory)
        patientUpdate.medicalHistory = input.medicalHistory;
      if (input.currentMedications)
        patientUpdate.currentMedications = input.currentMedications;
      if (input.allergies) patientUpdate.allergies = input.allergies;

      if (Object.keys(patientUpdate).length > 0) {
        patientUpdate.updatedAt = new Date();

        const [updatedPatient] = await db
          .update(patients)
          .set(patientUpdate)
          .where(eq(patients.id, patientData.patientId))
          .returning();

        return updatedPatient;
      }

      return null;
    }),

  // Get pending doctor reviews for patient
  getPendingDoctorReviews: protectedProcedure.query(async ({ ctx }) => {
    const [patientData] = await db
      .select({ patientId: patients.id })
      .from(users)
      .innerJoin(patients, eq(users.id, patients.userId))
      .where(eq(users.clerkId, ctx.clerkUserId!))
      .limit(1);

    if (!patientData) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Patient not found",
      });
    }

    const pendingReviews = await db
      .select({
        id: diagnosisSessions.id,
        chiefComplaint: diagnosisSessions.chiefComplaint,
        additionalInfo: diagnosisSessions.additionalInfo,
        status: diagnosisSessions.status,
        urgencyLevel: diagnosisSessions.urgencyLevel,
        isEmergency: diagnosisSessions.isEmergency,
        createdAt: diagnosisSessions.createdAt,
        doctorName: users.name,
        doctorSpecialization: doctors.specialization,
      })
      .from(diagnosisSessions)
      .leftJoin(doctors, eq(diagnosisSessions.doctorId, doctors.id))
      .leftJoin(users, eq(doctors.userId, users.id))
      .where(
        and(
          eq(diagnosisSessions.patientId, patientData.patientId),
          eq(diagnosisSessions.requiresDoctorReview, true),
          eq(diagnosisSessions.status, "pending")
        )
      )
      .orderBy(desc(diagnosisSessions.createdAt));

    return pendingReviews;
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
      const [patientData] = await db
        .select({ patientId: patients.id })
        .from(users)
        .innerJoin(patients, eq(users.id, patients.userId))
        .where(eq(users.clerkId, ctx.clerkUserId!))
        .limit(1);

      if (!patientData) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Patient not found",
        });
      }

      const offset = (input.page - 1) * input.limit;

      // First get the diagnosis sessions
      const sessions = await db
        .select({
          sessionId: diagnosisSessions.id,
          chiefComplaint: diagnosisSessions.chiefComplaint,
          finalDiagnosis: diagnosisSessions.finalDiagnosis,
          doctorNotes: diagnosisSessions.doctorNotes,
          confidence_score: diagnosisSessions.confidence_score,
          status: diagnosisSessions.status,
          completedAt: diagnosisSessions.completedAt,
          doctorId: diagnosisSessions.doctorId,
        })
        .from(diagnosisSessions)
        .where(
          and(
            eq(diagnosisSessions.patientId, patientData.patientId),
            eq(diagnosisSessions.status, "reviewed")
          )
        )
        .orderBy(desc(diagnosisSessions.completedAt))
        .limit(input.limit)
        .offset(offset);

      // Then get doctor info and reviews for each session
      const reviewHistory = await Promise.all(
        sessions.map(async (session) => {
          let doctorInfo = null;
          let doctorReview = null;

          // Get doctor info if doctorId exists
          if (session.doctorId) {
            const [doctorData] = await db
              .select({
                doctorName: users.name,
                doctorSpecialization: doctors.specialization,
              })
              .from(doctors)
              .leftJoin(users, eq(doctors.userId, users.id))
              .where(eq(doctors.id, session.doctorId))
              .limit(1);
            doctorInfo = doctorData;
          }

          // Get doctor review
          const [reviewData] = await db
            .select({
              finalDiagnosis: doctorReviews.finalDiagnosis,
              confidence: doctorReviews.confidence,
              notes: doctorReviews.notes,
              agreesWithML: doctorReviews.agreesWithML,
              recommendedActions: doctorReviews.recommendedActions,
              createdAt: doctorReviews.createdAt,
            })
            .from(doctorReviews)
            .where(eq(doctorReviews.sessionId, session.sessionId))
            .limit(1);
          doctorReview = reviewData;

          return {
            sessionId: session.sessionId,
            chiefComplaint: session.chiefComplaint,
            finalDiagnosis: session.finalDiagnosis,
            doctorNotes: session.doctorNotes,
            confidence_score: session.confidence_score,
            status: session.status,
            completedAt: session.completedAt,
            doctorName: doctorInfo?.doctorName || null,
            doctorSpecialization: doctorInfo?.doctorSpecialization || null,
            doctorReview: doctorReview || null,
          };
        })
      );

      return reviewHistory;
    }),

  // Get detailed case status for patient
  getCaseStatus: protectedProcedure
    .input(z.object({ sessionId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [patientData] = await db
        .select({ patientId: patients.id })
        .from(users)
        .innerJoin(patients, eq(users.id, patients.userId))
        .where(eq(users.clerkId, ctx.clerkUserId!))
        .limit(1);

      if (!patientData) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Patient not found",
        });
      }

      const caseDetails = await db
        .select({
          id: diagnosisSessions.id,
          status: diagnosisSessions.status,
          chiefComplaint: diagnosisSessions.chiefComplaint,
          additionalInfo: diagnosisSessions.additionalInfo,
          finalDiagnosis: diagnosisSessions.finalDiagnosis,
          doctorNotes: diagnosisSessions.doctorNotes,
          confidence_score: diagnosisSessions.confidence_score,
          urgencyLevel: diagnosisSessions.urgencyLevel,
          isEmergency: diagnosisSessions.isEmergency,
          requiresDoctorReview: diagnosisSessions.requiresDoctorReview,
          createdAt: diagnosisSessions.createdAt,
          updatedAt: diagnosisSessions.updatedAt,
          completedAt: diagnosisSessions.completedAt,
          doctorName: users.name,
          doctorSpecialization: doctors.specialization,
          doctorEmail: users.email,
        })
        .from(diagnosisSessions)
        .leftJoin(doctors, eq(diagnosisSessions.doctorId, doctors.id))
        .leftJoin(users, eq(doctors.userId, users.id))
        .where(
          and(
            eq(diagnosisSessions.id, input.sessionId),
            eq(diagnosisSessions.patientId, patientData.patientId)
          )
        )
        .limit(1);

      if (!caseDetails.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Case not found",
        });
      }

      return caseDetails[0];
    }),
});

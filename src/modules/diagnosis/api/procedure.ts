import { z } from "zod";
import { db } from "@/db";
import {
  diagnosisSessions,
  patients,
  users,
  mlPredictions,
  diseases,
  doctors,
} from "@/db/schema";
import {
  protectedProcedure,
  createTRPCRouter,
  patientProcedure,
  doctorProcedure,
} from "@/trpc/init";
import { diagnosisRequestSchema } from "../schema";
import { eq, desc, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { analyzeSymptomsWithAI } from "@/lib/openai-service";
import { predictDiseases } from "@/lib/ml-prediction-service";
import { notifications } from "@/db/schema";

export const diagnosisRouter = createTRPCRouter({
  // Start a new diagnosis session
  startDiagnosis: patientProcedure
    .input(diagnosisRequestSchema)
    .mutation(async ({ input, ctx }) => {
      // Get patient ID
      const [patientData] = await db
        .select({ patientId: patients.id, userId: patients.userId })
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

      // Create diagnosis session
      const [session] = await db
        .insert(diagnosisSessions)
        .values({
          patientId: patientData.patientId,
          doctorId: input.preferredDoctorId || null, // Assign selected doctor if provided
          chiefComplaint: input.symptoms.join(", "),
          additionalInfo: `Age: ${input.age}, Gender: ${
            input.gender
          }, Duration: ${input.duration}, Severity: ${input.severity}${
            input.additionalNotes ? `, Notes: ${input.additionalNotes}` : ""
          }`,
          status: input.preferredDoctorId ? "pending" : "in_progress", // Pending if doctor assigned
          urgencyLevel: input.severity === "severe" ? "high" : "medium",
          isEmergency: input.severity === "severe",
          requiresDoctorReview: input.preferredDoctorId
            ? true
            : input.severity === "severe",
        })
        .returning();

      // Use the prediction method chosen by the user
      const useAI = input.predictionMethod === "ai";

      let predictions;
      let modelVersion;

      if (useAI) {
        // Generate AI predictions using OpenAI
        try {
          predictions = await analyzeSymptomsWithAI({
            symptoms: input.symptoms,
            age: input.age,
            gender: input.gender,
            duration: input.duration,
            severity: input.severity,
            additionalNotes: input.additionalNotes,
          });
          modelVersion = "gpt-3.5-turbo-ai-v1.0";
        } catch (aiError) {
          console.warn("AI prediction failed, falling back to ML:", aiError);
          // Fallback to ML if AI fails
          predictions = await predictDiseases({
            symptoms: input.symptoms,
            age: input.age,
            gender: input.gender,
            duration: input.duration,
            severity: input.severity,
            additionalNotes: input.additionalNotes,
          });
          modelVersion = "ml-fallback-v1.0";
        }
      } else {
        // Use ML predictions (mock system)
        predictions = await predictDiseases({
          symptoms: input.symptoms,
          age: input.age,
          gender: input.gender,
          duration: input.duration,
          severity: input.severity,
          additionalNotes: input.additionalNotes,
        });
        modelVersion = "ml-mock-v1.0";
      }

      // Store predictions in database
      try {
        if (predictions.length === 0) {
          console.warn(
            "⚠️ No predictions generated, creating fallback prediction"
          );
          // Find a common disease from the database for fallback
          const commonDiseases = await db
            .select()
            .from(diseases)
            .where(eq(diseases.name, "Common Cold"))
            .limit(1);
          const fallbackDiseaseId = commonDiseases[0]?.id || "fallback";

          predictions = [
            {
              diseaseId: fallbackDiseaseId,
              confidence: 0.3,
              confidenceIntervalLow: 0.2,
              confidenceIntervalHigh: 0.4,
              reasoning: [
                "Unable to match symptoms to specific conditions",
                "General symptoms suggest common viral infection",
              ],
              riskFactors: ["Symptom presentation"],
              recommendations: [
                "Monitor symptoms",
                "Consult healthcare provider if symptoms worsen",
                "Rest and stay hydrated",
              ],
            },
          ];
        }

        const predictionInserts = predictions.map((prediction) => ({
          sessionId: session.id,
          diseaseId: prediction.diseaseId,
          confidence: prediction.confidence.toString(),
          confidenceIntervalLow: prediction.confidenceIntervalLow.toString(),
          confidenceIntervalHigh: prediction.confidenceIntervalHigh.toString(),
          modelVersion: modelVersion,
          reasoning: prediction.reasoning,
          riskFactors: prediction.riskFactors,
          recommendations: prediction.recommendations,
        }));

        await db.insert(mlPredictions).values(predictionInserts);

        // Update session status to completed
        await db
          .update(diagnosisSessions)
          .set({
            status: "completed",
            finalDiagnosis: predictions[0]?.diseaseId || null,
            confidence_score: predictions[0]?.confidence.toString() || null,
            completedAt: new Date(),
          })
          .where(eq(diagnosisSessions.id, session.id));

        // Create notification for diagnosis completion
        try {
          const urgencyLevel = session.urgencyLevel;
          const notificationType =
            urgencyLevel === "emergency" || urgencyLevel === "high"
              ? "high_risk_alert"
              : "diagnosis_complete";

          await db.insert(notifications).values({
            userId: patientData.userId,
            type: notificationType,
            title:
              urgencyLevel === "emergency" || urgencyLevel === "high"
                ? "🚨 High Priority Diagnosis Complete"
                : "✅ Diagnosis Analysis Complete",
            message:
              urgencyLevel === "emergency" || urgencyLevel === "high"
                ? `Your diagnosis analysis is complete with ${urgencyLevel} priority. Please review results immediately.`
                : "Your symptom analysis has been completed. Please review the results.",
            data: {
              sessionId: session.id,
              urgencyLevel: urgencyLevel,
              predictionMethod: useAI ? "ai" : "ml",
              confidence: predictions[0]?.confidence || 0,
            },
            isRead: false,
          });
        } catch (notificationError) {
          console.error("Failed to create notification:", notificationError);
          // Don't fail the entire request if notification creation fails
        }

        // If a doctor was selected, create notification
        if (input.preferredDoctorId) {
          // Get doctor's user ID for notification
          const [doctorUser] = await db
            .select({ userId: users.id })
            .from(doctors)
            .innerJoin(users, eq(doctors.userId, users.id))
            .where(eq(doctors.id, input.preferredDoctorId))
            .limit(1);

          if (doctorUser) {
            await db.insert(notifications).values({
              userId: doctorUser.userId,
              type: "doctor_review_needed",
              title: "New Case Assignment",
              message: "A patient has selected you for their diagnosis review",
              data: {
                sessionId: session.id,
                patientId: patientData.patientId,
              },
            });
          }
        }
      } catch (error) {
        console.error("AI prediction failed:", error);
        // Update session status to indicate error
        await db
          .update(diagnosisSessions)
          .set({
            status: "pending",
            additionalInfo: `${session.additionalInfo} [AI Error: ${
              error instanceof Error ? error.message : "Unknown error"
            }]`,
          })
          .where(eq(diagnosisSessions.id, session.id));
      }

      return {
        sessionId: session.id,
        status: "completed",
        urgencyLevel: session.urgencyLevel,
        message: "Diagnosis analysis completed. View your results below.",
      };
    }),

  // Get diagnosis session details
  getDiagnosisSession: protectedProcedure
    .input(z.object({ sessionId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const [session] = await db
        .select({
          id: diagnosisSessions.id,
          patientId: diagnosisSessions.patientId,
          doctorId: diagnosisSessions.doctorId,
          status: diagnosisSessions.status,
          urgencyLevel: diagnosisSessions.urgencyLevel,
          chiefComplaint: diagnosisSessions.chiefComplaint,
          additionalInfo: diagnosisSessions.additionalInfo,
          finalDiagnosis: diagnosisSessions.finalDiagnosis,
          doctorNotes: diagnosisSessions.doctorNotes,
          confidence_score: diagnosisSessions.confidence_score,
          requiresDoctorReview: diagnosisSessions.requiresDoctorReview,
          isEmergency: diagnosisSessions.isEmergency,
          createdAt: diagnosisSessions.createdAt,
          completedAt: diagnosisSessions.completedAt,
        })
        .from(diagnosisSessions)
        .where(eq(diagnosisSessions.id, input.sessionId))
        .limit(1);

      if (!session) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Diagnosis session not found",
        });
      }

      // Check if user has access to this session
      if (ctx.user.role === "patient") {
        const [patientData] = await db
          .select({ patientId: patients.id })
          .from(users)
          .innerJoin(patients, eq(users.id, patients.userId))
          .where(eq(users.clerkId, ctx.clerkUserId!))
          .limit(1);

        if (!patientData || patientData.patientId !== session.patientId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have access to this diagnosis session",
          });
        }
      }

      return session;
    }),

  // Get ML predictions for a session
  getMLPredictions: protectedProcedure
    .input(z.object({ sessionId: z.string().uuid() }))
    .query(async ({ input }) => {
      const predictions = await db
        .select({
          id: mlPredictions.id,
          confidence: mlPredictions.confidence,
          confidenceIntervalLow: mlPredictions.confidenceIntervalLow,
          confidenceIntervalHigh: mlPredictions.confidenceIntervalHigh,
          modelVersion: mlPredictions.modelVersion,
          reasoning: mlPredictions.reasoning,
          riskFactors: mlPredictions.riskFactors,
          recommendations: mlPredictions.recommendations,
          disease: {
            id: diseases.id,
            name: diseases.name,
            description: diseases.description,
            icdCode: diseases.icdCode,
            severityLevel: diseases.severityLevel,
            treatmentInfo: diseases.treatmentInfo,
            preventionInfo: diseases.preventionInfo,
          },
          createdAt: mlPredictions.createdAt,
        })
        .from(mlPredictions)
        .innerJoin(diseases, eq(mlPredictions.diseaseId, diseases.id))
        .where(eq(mlPredictions.sessionId, input.sessionId))
        .orderBy(desc(mlPredictions.confidence));

      return predictions;
    }),

  // Get recent diagnosis sessions
  getRecentSessions: protectedProcedure
    .input(
      z.object({
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
    .query(async ({ input, ctx }) => {
      let whereCondition;

      if (ctx.user.role === "patient") {
        // For patients, only show their own sessions
        const [patientData] = await db
          .select({ patientId: patients.id })
          .from(users)
          .innerJoin(patients, eq(users.id, patients.userId))
          .where(eq(users.clerkId, ctx.clerkUserId!))
          .limit(1);

        if (!patientData) {
          return [];
        }

        const conditions = [
          eq(diagnosisSessions.patientId, patientData.patientId),
        ];
        if (input.status) {
          conditions.push(eq(diagnosisSessions.status, input.status));
        }
        whereCondition =
          conditions.length > 1 ? and(...conditions) : conditions[0];
      } else {
        // For doctors/admins, show all sessions or filtered by status
        whereCondition = input.status
          ? eq(diagnosisSessions.status, input.status)
          : undefined;
      }

      const sessions = await db
        .select({
          id: diagnosisSessions.id,
          patientId: diagnosisSessions.patientId,
          status: diagnosisSessions.status,
          urgencyLevel: diagnosisSessions.urgencyLevel,
          chiefComplaint: diagnosisSessions.chiefComplaint,
          finalDiagnosis: diagnosisSessions.finalDiagnosis,
          confidence_score: diagnosisSessions.confidence_score,
          isEmergency: diagnosisSessions.isEmergency,
          requiresDoctorReview: diagnosisSessions.requiresDoctorReview,
          createdAt: diagnosisSessions.createdAt,
          completedAt: diagnosisSessions.completedAt,
        })
        .from(diagnosisSessions)
        .where(whereCondition)
        .orderBy(desc(diagnosisSessions.createdAt))
        .limit(input.limit);

      return sessions;
    }),

  // Get emergency cases (for doctors/admins)
  getEmergencyCases: doctorProcedure
    .input(
      z.object({
        limit: z.number().default(20),
      })
    )
    .query(async ({ input }) => {
      const emergencyCases = await db
        .select({
          id: diagnosisSessions.id,
          patientId: diagnosisSessions.patientId,
          status: diagnosisSessions.status,
          urgencyLevel: diagnosisSessions.urgencyLevel,
          chiefComplaint: diagnosisSessions.chiefComplaint,
          additionalInfo: diagnosisSessions.additionalInfo,
          finalDiagnosis: diagnosisSessions.finalDiagnosis,
          confidence_score: diagnosisSessions.confidence_score,
          requiresDoctorReview: diagnosisSessions.requiresDoctorReview,
          createdAt: diagnosisSessions.createdAt,
        })
        .from(diagnosisSessions)
        .where(eq(diagnosisSessions.isEmergency, true))
        .orderBy(desc(diagnosisSessions.createdAt))
        .limit(input.limit);

      return emergencyCases;
    }),

  // Update diagnosis session status (for system/ML processing)
  updateSessionStatus: protectedProcedure
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
        finalDiagnosis: z.string().optional(),
        confidence_score: z.string().optional(),
        completedAt: z.date().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const updateData: Record<string, unknown> = {
        status: input.status,
        updatedAt: new Date(),
      };

      if (input.finalDiagnosis)
        updateData.finalDiagnosis = input.finalDiagnosis;
      if (input.confidence_score)
        updateData.confidence_score = input.confidence_score;
      if (input.completedAt) updateData.completedAt = input.completedAt;

      const [updatedSession] = await db
        .update(diagnosisSessions)
        .set(updateData)
        .where(eq(diagnosisSessions.id, input.sessionId))
        .returning();

      return updatedSession;
    }),
});

import { z } from "zod";
import { db } from "@/db";
import {
  mlPredictions,
  diagnosisSessions,
  diseases,
  patients,
  users,
} from "@/db/schema";
import {
  protectedProcedure,
  createTRPCRouter,
  adminProcedure,
  doctorProcedure,
} from "@/trpc/init";
import { predictionSchema } from "../schema";
import { eq, desc, and, count, avg, gte } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const mlRouter = createTRPCRouter({
  // Get model performance metrics
  getModelMetrics: adminProcedure
    .input(
      z.object({
        modelVersion: z.string().optional(),
        timeRange: z.enum(["7d", "30d", "90d", "1y"]).default("30d"),
      })
    )
    .query(async ({ input }) => {
      // Calculate date range
      const now = new Date();
      const daysAgo = {
        "7d": 7,
        "30d": 30,
        "90d": 90,
        "1y": 365,
      }[input.timeRange];

      const fromDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

      // Base conditions
      const conditions = [gte(mlPredictions.createdAt, fromDate)];
      if (input.modelVersion) {
        conditions.push(eq(mlPredictions.modelVersion, input.modelVersion));
      }

      const whereCondition =
        conditions.length > 1 ? and(...conditions) : conditions[0];

      // Get prediction count
      const [predictionCount] = await db
        .select({ count: count() })
        .from(mlPredictions)
        .where(whereCondition);

      // Get average confidence
      const [avgConfidence] = await db
        .select({ average: avg(mlPredictions.confidence) })
        .from(mlPredictions)
        .where(whereCondition);

      // Get high-confidence predictions (>0.8)
      const [highConfidenceCount] = await db
        .select({ count: count() })
        .from(mlPredictions)
        .where(and(whereCondition!, gte(mlPredictions.confidence, "0.8")));

      return {
        totalPredictions: predictionCount.count,
        averageConfidence: parseFloat(avgConfidence.average || "0"),
        highConfidencePredictions: highConfidenceCount.count,
        accuracyRate:
          predictionCount.count > 0
            ? (highConfidenceCount.count / predictionCount.count) * 100
            : 0,
      };
    }),

  // Get prediction details for a session
  getSessionPredictions: protectedProcedure
    .input(z.object({ sessionId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      // Verify user has access to this session
      const [session] = await db
        .select({
          id: diagnosisSessions.id,
          patientId: diagnosisSessions.patientId,
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

      // Check access permissions
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
            message: "You don't have access to this session",
          });
        }
      }

      // Get predictions with disease details
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

  // Create ML prediction (internal use)
  createPrediction: adminProcedure
    .input(predictionSchema)
    .mutation(async ({ input }) => {
      const [prediction] = await db
        .insert(mlPredictions)
        .values({
          sessionId: input.sessionId,
          diseaseId: input.modelId, // Using modelId as diseaseId for now
          confidence: input.confidence.toString(),
          confidenceIntervalLow: (input.confidence - 0.1).toString(),
          confidenceIntervalHigh: (input.confidence + 0.1).toString(),
          modelVersion: "v1.0", // Default model version
          reasoning: ["AI analysis based on symptom patterns"],
          riskFactors: ["Based on reported symptoms"],
          recommendations: [
            "Consult healthcare provider for detailed evaluation",
          ],
        })
        .returning();

      return prediction;
    }),

  // Get top diseases by prediction frequency
  getTopDiseases: doctorProcedure
    .input(
      z.object({
        limit: z.number().default(10),
        timeRange: z.enum(["7d", "30d", "90d", "1y"]).default("30d"),
      })
    )
    .query(async ({ input }) => {
      const now = new Date();
      const daysAgo = {
        "7d": 7,
        "30d": 30,
        "90d": 90,
        "1y": 365,
      }[input.timeRange];

      const fromDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

      // Get disease prediction counts
      const topDiseases = await db
        .select({
          disease: {
            id: diseases.id,
            name: diseases.name,
            description: diseases.description,
            severityLevel: diseases.severityLevel,
          },
          predictionCount: count(),
          averageConfidence: avg(mlPredictions.confidence),
        })
        .from(mlPredictions)
        .innerJoin(diseases, eq(mlPredictions.diseaseId, diseases.id))
        .where(gte(mlPredictions.createdAt, fromDate))
        .groupBy(
          diseases.id,
          diseases.name,
          diseases.description,
          diseases.severityLevel
        )
        .orderBy(desc(count()))
        .limit(input.limit);

      return topDiseases;
    }),

  // Get confidence distribution
  getConfidenceDistribution: adminProcedure
    .input(
      z.object({
        timeRange: z.enum(["7d", "30d", "90d", "1y"]).default("30d"),
      })
    )
    .query(async ({ input }) => {
      const now = new Date();
      const daysAgo = {
        "7d": 7,
        "30d": 30,
        "90d": 90,
        "1y": 365,
      }[input.timeRange];

      const fromDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

      // Get predictions in time range
      const predictions = await db
        .select({
          confidence: mlPredictions.confidence,
        })
        .from(mlPredictions)
        .where(gte(mlPredictions.createdAt, fromDate));

      // Group by confidence ranges
      const distribution = {
        "0.0-0.2": 0,
        "0.2-0.4": 0,
        "0.4-0.6": 0,
        "0.6-0.8": 0,
        "0.8-1.0": 0,
      };

      predictions.forEach((pred) => {
        const conf = parseFloat(pred.confidence);
        if (conf < 0.2) distribution["0.0-0.2"]++;
        else if (conf < 0.4) distribution["0.2-0.4"]++;
        else if (conf < 0.6) distribution["0.4-0.6"]++;
        else if (conf < 0.8) distribution["0.6-0.8"]++;
        else distribution["0.8-1.0"]++;
      });

      return distribution;
    }),

  // Get recent high-risk predictions
  getHighRiskPredictions: doctorProcedure
    .input(
      z.object({
        limit: z.number().default(20),
        minConfidence: z.number().default(0.8),
      })
    )
    .query(async ({ input }) => {
      const highRiskPredictions = await db
        .select({
          id: mlPredictions.id,
          sessionId: mlPredictions.sessionId,
          confidence: mlPredictions.confidence,
          reasoning: mlPredictions.reasoning,
          riskFactors: mlPredictions.riskFactors,
          disease: {
            name: diseases.name,
            severityLevel: diseases.severityLevel,
          },
          session: {
            chiefComplaint: diagnosisSessions.chiefComplaint,
            urgencyLevel: diagnosisSessions.urgencyLevel,
            isEmergency: diagnosisSessions.isEmergency,
            createdAt: diagnosisSessions.createdAt,
          },
          createdAt: mlPredictions.createdAt,
        })
        .from(mlPredictions)
        .innerJoin(diseases, eq(mlPredictions.diseaseId, diseases.id))
        .innerJoin(
          diagnosisSessions,
          eq(mlPredictions.sessionId, diagnosisSessions.id)
        )
        .where(
          and(
            gte(mlPredictions.confidence, input.minConfidence.toString()),
            eq(diseases.severityLevel, "severe")
          )
        )
        .orderBy(desc(mlPredictions.createdAt))
        .limit(input.limit);

      return highRiskPredictions;
    }),
});

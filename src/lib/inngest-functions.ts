import { inngest } from "./inngest-client";
import { OptimizedAIService } from "./optimized-openai-service";
import { AIUsageTracker } from "./ai-usage-tracker";
import { RateLimiter } from "./rate-limiter";
import { db } from "@/db";
import { diagnosisSessions, mlPredictions, notifications } from "@/db/schema";
import { eq } from "drizzle-orm";

// AI Diagnosis Processing Function
export const processAIDiagnosis = inngest.createFunction(
  { id: "process-ai-diagnosis" },
  { event: "ai/diagnosis.requested" },
  async ({ event, step }) => {
    const {
      sessionId,
      userId,
      symptoms,
      age,
      gender,
      duration,
      severity,
      additionalNotes,
      priority,
    } = event.data;

    console.log(
      `Processing AI diagnosis for session ${sessionId} with priority ${priority}`
    );

    // Step 1: Validate session exists
    const session = await step.run("validate-session", async () => {
      const [sessionData] = await db
        .select()
        .from(diagnosisSessions)
        .where(eq(diagnosisSessions.id, sessionId))
        .limit(1);

      if (!sessionData) {
        throw new Error(`Session ${sessionId} not found`);
      }

      return sessionData;
    });

    // Step 2: Check rate limits
    const rateLimitCheck = await step.run("check-rate-limits", async () => {
      if (priority === "emergency") {
        return await RateLimiter.checkEmergencyLimit(userId);
      } else {
        return await RateLimiter.checkAIDiagnosisLimit(userId);
      }
    });

    if (!rateLimitCheck.allowed) {
      await step.run("handle-rate-limit-exceeded", async () => {
        await db
          .update(diagnosisSessions)
          .set({
            status: "cancelled",
            additionalInfo: `${session.additionalInfo} [Rate limit exceeded: ${rateLimitCheck.retryAfter}s]`,
          })
          .where(eq(diagnosisSessions.id, sessionId));

        // Create notification
        await db.insert(notifications).values({
          userId: userId,
          type: "rate_limit_exceeded",
          title: "⏱️ Rate Limit Exceeded",
          message: `You've reached your AI diagnosis limit. Try again in ${rateLimitCheck.retryAfter} seconds.`,
          data: {
            sessionId,
            retryAfter: rateLimitCheck.retryAfter,
            limitType: priority === "emergency" ? "emergency" : "ai_diagnosis",
          },
          isRead: false,
        });
      });

      throw new Error(
        `Rate limit exceeded. Retry after ${rateLimitCheck.retryAfter} seconds.`
      );
    }

    // Step 3: Check usage limits
    const usageCheck = await step.run("check-usage-limits", async () => {
      const estimatedTokens = AIUsageTracker.estimateTokens(
        symptoms,
        additionalNotes
      );
      return await AIUsageTracker.canMakeRequest(userId, estimatedTokens);
    });

    if (!usageCheck.allowed) {
      await step.run("handle-usage-limit-exceeded", async () => {
        await db
          .update(diagnosisSessions)
          .set({
            status: "cancelled",
            additionalInfo: `${session.additionalInfo} [Usage limit exceeded: ${usageCheck.reason}]`,
          })
          .where(eq(diagnosisSessions.id, sessionId));

        // Create notification
        await db.insert(notifications).values({
          userId: userId,
          type: "usage_limit_exceeded",
          title: "📊 Usage Limit Exceeded",
          message: `You've reached your AI usage limit: ${usageCheck.reason}`,
          data: {
            sessionId,
            reason: usageCheck.reason,
            usage: usageCheck.usage,
          },
          isRead: false,
        });

        // Trigger usage limit exceeded event
        await inngest.send({
          name: "ai/usage.limit.exceeded",
          data: {
            userId,
            limitType: "daily", // or determine from reason
            currentUsage: usageCheck.usage?.daily || 0,
            limit: AIUsageTracker.getUsageLimits().dailyLimit,
            sessionId,
          },
        });
      });

      throw new Error(`Usage limit exceeded: ${usageCheck.reason}`);
    }

    // Step 4: Process AI diagnosis
    const startTime = Date.now();
    const predictions = await step.run("process-ai-diagnosis", async () => {
      try {
        return await OptimizedAIService.analyzeSymptomsWithAI(
          {
            symptoms,
            age,
            gender,
            duration,
            severity,
            additionalNotes,
          },
          userId
        );
      } catch (error) {
        console.error("AI processing failed:", error);
        throw error;
      }
    });

    const processingTime = Date.now() - startTime;

    // Step 5: Store predictions
    await step.run("store-predictions", async () => {
      if (predictions.length === 0) {
        throw new Error("No predictions generated");
      }

      const predictionInserts = predictions.map((prediction) => ({
        sessionId: sessionId,
        diseaseId: prediction.diseaseId,
        confidence: prediction.confidence.toString(),
        confidenceIntervalLow: prediction.confidenceIntervalLow.toString(),
        confidenceIntervalHigh: prediction.confidenceIntervalHigh.toString(),
        modelVersion: "gpt-3.5-turbo-optimized-v1.0",
        reasoning: prediction.reasoning,
        riskFactors: prediction.riskFactors,
        recommendations: prediction.recommendations,
        aiExplanation: prediction.aiExplanation,
      }));

      await db.insert(mlPredictions).values(predictionInserts);
    });

    // Step 6: Update session status
    await step.run("update-session-status", async () => {
      const updateData: Record<string, unknown> = {
        status: "completed",
        finalDiagnosis: predictions[0]?.diseaseId || null,
        confidence_score: predictions[0]?.confidence.toString() || null,
        completedAt: new Date(),
      };

      await db
        .update(diagnosisSessions)
        .set(updateData)
        .where(eq(diagnosisSessions.id, sessionId));
    });

    // Step 7: Create completion notification
    await step.run("create-completion-notification", async () => {
      const urgencyLevel = session.urgencyLevel;
      const notificationType =
        urgencyLevel === "emergency" || urgencyLevel === "high"
          ? "high_risk_alert"
          : "diagnosis_complete";

      const title =
        urgencyLevel === "emergency" || urgencyLevel === "high"
          ? "🚨 High Priority Diagnosis Complete"
          : "✅ AI Diagnosis Complete";

      const message =
        urgencyLevel === "emergency" || urgencyLevel === "high"
          ? `Your AI diagnosis analysis is complete with ${urgencyLevel} priority. Please review results immediately.`
          : "Your AI-powered symptom analysis has been completed. Please review the results.";

      await db.insert(notifications).values({
        userId: userId,
        type: notificationType,
        title: title,
        message: message,
        data: {
          sessionId: sessionId,
          urgencyLevel: urgencyLevel,
          predictionMethod: "ai",
          confidence: predictions[0]?.confidence || 0,
          processingTime: processingTime,
        },
        isRead: false,
      });
    });

    // Step 8: Record usage
    await step.run("record-usage", async () => {
      const tokensUsed = AIUsageTracker.estimateTokens(
        symptoms,
        additionalNotes
      );
      await AIUsageTracker.recordUsage({
        userId,
        sessionId,
        tokensUsed,
        cost: AIUsageTracker.calculateCost(tokensUsed),
        model: "gpt-3.5-turbo",
        endpoint: "ai/diagnosis",
        processingTime: processingTime,
        success: true,
        timestamp: new Date(),
      });
    });

    // Step 9: Send completion event
    await step.run("send-completion-event", async () => {
      const tokensUsed = AIUsageTracker.estimateTokens(
        symptoms,
        additionalNotes
      );

      await inngest.send({
        name: "ai/diagnosis.completed",
        data: {
          sessionId,
          userId,
          predictions,
          modelVersion: "gpt-3.5-turbo-optimized-v1.0",
          tokensUsed,
          cost: AIUsageTracker.calculateCost(tokensUsed),
          processingTime,
        },
      });
    });

    console.log(
      `AI diagnosis completed for session ${sessionId} in ${processingTime}ms`
    );

    return {
      sessionId,
      predictions: predictions.length,
      processingTime,
      success: true,
    };
  }
);

// Usage Limit Monitoring Function
export const monitorUsageLimits = inngest.createFunction(
  { id: "monitor-usage-limits" },
  { event: "ai/usage.limit.exceeded" },
  async ({ event, step }) => {
    const { userId, limitType, currentUsage, limit } = event.data;

    console.log(`Usage limit exceeded for user ${userId}: ${limitType}`);

    // Step 1: Log the usage limit exceeded event
    await step.run("log-usage-limit", async () => {
      console.log(
        `User ${userId} exceeded ${limitType} limit: ${currentUsage}/${limit}`
      );

      // In a real implementation, you might want to:
      // - Send alerts to administrators
      // - Log to monitoring systems
      // - Update user status
    });

    // Step 2: Create admin notification (if applicable)
    await step.run("notify-admins", async () => {
      // You could create notifications for administrators
      // when users hit usage limits
      console.log(`Admin notification: User ${userId} hit ${limitType} limit`);
    });

    return {
      userId,
      limitType,
      currentUsage,
      limit,
      timestamp: new Date().toISOString(),
    };
  }
);

// Retry Failed AI Requests Function
export const retryFailedAIRequests = inngest.createFunction(
  { id: "retry-failed-ai-requests" },
  { event: "ai/diagnosis.failed" },
  async ({ event, step }) => {
    const { sessionId, userId, error, retryCount, maxRetries } = event.data;

    console.log(
      `Retrying failed AI request for session ${sessionId} (attempt ${
        retryCount + 1
      }/${maxRetries})`
    );

    if (retryCount >= maxRetries) {
      await step.run("handle-max-retries-exceeded", async () => {
        await db
          .update(diagnosisSessions)
          .set({
            status: "cancelled",
            additionalInfo: `AI processing failed after ${maxRetries} attempts: ${error}`,
          })
          .where(eq(diagnosisSessions.id, sessionId));

        await db.insert(notifications).values({
          userId: userId,
          type: "ai_processing_failed",
          title: "❌ AI Processing Failed",
          message:
            "AI analysis failed after multiple attempts. Please try again later or contact support.",
          data: {
            sessionId,
            error,
            retryCount,
            maxRetries,
          },
          isRead: false,
        });
      });

      return { success: false, reason: "Max retries exceeded" };
    }

    // Wait before retry with exponential backoff
    const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 30000); // Max 30 seconds

    await step.sleep("wait-before-retry", `${retryDelay}ms`);

    // Retry the AI request
    await step.run("retry-ai-request", async () => {
      await inngest.send({
        name: "ai/diagnosis.requested",
        data: {
          ...event.data,
          retryCount: retryCount + 1,
        },
      });
    });

    return { success: true, retryCount: retryCount + 1 };
  }
);

// Test function to debug Inngest issues
export const testFunction = inngest.createFunction(
  { id: "test-function" },
  { event: "test/event" },
  async ({ event }) => {
    console.log("Test function executed:", event);
    return { success: true, message: "Test function executed successfully" };
  }
);

// Simple AI diagnosis function without database operations for testing
export const simpleAIDiagnosis = inngest.createFunction(
  { id: "simple-ai-diagnosis" },
  { event: "ai/diagnosis.requested" },
  async ({ event, step }) => {
    console.log("Simple AI diagnosis function executed:", event);

    // Simulate AI processing
    await step.sleep("ai-processing", "2s");

    return {
      sessionId: event.data.sessionId,
      predictions: [
        {
          diseaseId: "test-disease",
          confidence: 0.85,
          confidenceIntervalLow: 0.8,
          confidenceIntervalHigh: 0.9,
          reasoning: ["Test reasoning"],
          riskFactors: ["Test risk factor"],
          recommendations: ["Test recommendation"],
        },
      ],
      processingTime: 2000,
      success: true,
    };
  }
);

// Export all functions
export const inngestFunctions = [
  testFunction,
  simpleAIDiagnosis,
  processAIDiagnosis,
  monitorUsageLimits,
  retryFailedAIRequests,
];

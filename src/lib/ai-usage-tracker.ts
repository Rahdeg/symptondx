import { db } from "@/db";
import { aiUsageLogs } from "@/db/schema";
import { eq, and, gte, desc, sum } from "drizzle-orm";

export interface AIUsageRecord {
  userId: string;
  sessionId?: string;
  tokensUsed: number;
  cost: number;
  model: string;
  endpoint: string;
  processingTime?: number;
  success?: boolean;
  errorMessage?: string;
  timestamp: Date;
}

export interface UsageLimits {
  dailyLimit: number;
  monthlyLimit: number;
  perRequestLimit: number;
}

export class AIUsageTracker {
  private static readonly DAILY_LIMIT = 50000; // tokens per day (increased from 10k)
  private static readonly MONTHLY_LIMIT = 500000; // tokens per month (increased from 100k)
  private static readonly PER_REQUEST_LIMIT = 5000; // tokens per request (increased from 2k)
  private static readonly COST_PER_1K_TOKENS = 0.0015; // GPT-3.5-turbo cost

  /**
   * Check if user can make an AI request
   */
  static async canMakeRequest(
    userId: string,
    estimatedTokens: number = 2000
  ): Promise<{
    allowed: boolean;
    reason?: string;
    usage?: { daily: number; monthly: number; totalCost: number };
  }> {
    try {
      // Check per-request limit
      if (estimatedTokens > this.PER_REQUEST_LIMIT) {
        return {
          allowed: false,
          reason: `Request exceeds per-request limit of ${this.PER_REQUEST_LIMIT} tokens`,
        };
      }

      // Get user's current usage
      const usage = await this.getUserUsage(userId);

      // Check daily limit
      if (usage.daily + estimatedTokens > this.DAILY_LIMIT) {
        return {
          allowed: false,
          reason: `Daily limit of ${this.DAILY_LIMIT} tokens exceeded`,
          usage,
        };
      }

      // Check monthly limit
      if (usage.monthly + estimatedTokens > this.MONTHLY_LIMIT) {
        return {
          allowed: false,
          reason: `Monthly limit of ${this.MONTHLY_LIMIT} tokens exceeded`,
          usage,
        };
      }

      return { allowed: true, usage };
    } catch (error) {
      console.error("Error checking usage limits:", error);
      return { allowed: false, reason: "Error checking usage limits" };
    }
  }

  /**
   * Record AI usage
   */
  static async recordUsage(record: AIUsageRecord): Promise<void> {
    try {
      await db.insert(aiUsageLogs).values({
        userId: record.userId,
        sessionId: record.sessionId || null,
        tokensUsed: record.tokensUsed,
        cost: record.cost.toString(),
        model: record.model,
        endpoint: record.endpoint,
        processingTime: record.processingTime || null,
        success: record.success ?? true,
        errorMessage: record.errorMessage || null,
        createdAt: record.timestamp,
      });

      console.log("AI Usage Recorded:", {
        userId: record.userId,
        tokensUsed: record.tokensUsed,
        cost: record.cost,
        model: record.model,
        endpoint: record.endpoint,
      });
    } catch (error) {
      console.error("Error recording usage:", error);
    }
  }

  /**
   * Get user's current usage statistics
   */
  static async getUserUsage(userId: string): Promise<{
    daily: number;
    monthly: number;
    totalCost: number;
  }> {
    try {
      const now = new Date();
      const startOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const dailyUsage = await db
        .select({ total: sum(aiUsageLogs.tokensUsed) })
        .from(aiUsageLogs)
        .where(
          and(
            eq(aiUsageLogs.userId, userId),
            gte(aiUsageLogs.createdAt, startOfDay)
          )
        );

      const monthlyUsage = await db
        .select({ total: sum(aiUsageLogs.tokensUsed) })
        .from(aiUsageLogs)
        .where(
          and(
            eq(aiUsageLogs.userId, userId),
            gte(aiUsageLogs.createdAt, startOfMonth)
          )
        );

      const dailyTokens = Number(dailyUsage[0]?.total || 0);
      const monthlyTokens = Number(monthlyUsage[0]?.total || 0);

      return {
        daily: dailyTokens,
        monthly: monthlyTokens,
        totalCost: this.calculateCost(dailyTokens + monthlyTokens),
      };
    } catch (error) {
      console.error("Error getting user usage:", error);
      return { daily: 0, monthly: 0, totalCost: 0 };
    }
  }

  /**
   * Calculate cost based on token usage
   */
  static calculateCost(tokens: number): number {
    return (tokens / 1000) * this.COST_PER_1K_TOKENS;
  }

  /**
   * Get usage limits for a user
   */
  static getUsageLimits(): UsageLimits {
    return {
      dailyLimit: this.DAILY_LIMIT,
      monthlyLimit: this.MONTHLY_LIMIT,
      perRequestLimit: this.PER_REQUEST_LIMIT,
    };
  }

  /**
   * Estimate tokens for a request
   */
  static estimateTokens(symptoms: string[], additionalNotes?: string): number {
    const baseTokens = 500; // Base prompt tokens
    const symptomsTokens = symptoms.join(", ").length / 4; // Rough estimation
    const notesTokens = (additionalNotes?.length || 0) / 4;
    const responseTokens = 1000; // Expected response tokens

    return Math.ceil(
      baseTokens + symptomsTokens + notesTokens + responseTokens
    );
  }

  /**
   * Reset usage for a user (development only)
   */
  static async resetUserUsage(userId: string): Promise<void> {
    try {
      await db.delete(aiUsageLogs).where(eq(aiUsageLogs.userId, userId));
      console.log(`Usage reset for user: ${userId}`);
    } catch (error) {
      console.error("Error resetting usage:", error);
    }
  }

  /**
   * Get current usage statistics for debugging
   */
  static async getDebugUsage(userId: string): Promise<{
    daily: number;
    monthly: number;
    totalCost: number;
    recentRequests: Array<{
      tokensUsed: number;
      model: string;
      success: boolean | null;
      createdAt: Date | null;
      errorMessage: string | null;
    }>;
  }> {
    const usage = await this.getUserUsage(userId);

    // Get recent requests
    const recentRequests = await db
      .select()
      .from(aiUsageLogs)
      .where(eq(aiUsageLogs.userId, userId))
      .orderBy(desc(aiUsageLogs.createdAt))
      .limit(10);

    return {
      ...usage,
      recentRequests: recentRequests.map((req) => ({
        tokensUsed: req.tokensUsed,
        model: req.model,
        success: req.success,
        createdAt: req.createdAt,
        errorMessage: req.errorMessage,
      })),
    };
  }
}

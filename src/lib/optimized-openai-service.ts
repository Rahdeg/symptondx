import OpenAI from "openai";
import { z } from "zod";
import { db } from "@/db";
import { diseases } from "@/db/schema";
import { AICache } from "./ai-cache";
import { AIUsageTracker } from "./ai-usage-tracker";
import { RateLimiter } from "./rate-limiter";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Input schema for AI prediction
export const aiPredictionInputSchema = z.object({
  symptoms: z.array(z.string()),
  age: z.number(),
  gender: z.enum(["male", "female", "other"]),
  duration: z.string(),
  severity: z.enum(["mild", "moderate", "severe"]),
  additionalNotes: z.string().optional(),
});

export type AIPredictionInput = z.infer<typeof aiPredictionInputSchema>;

export interface AIPrediction {
  diseaseId: string;
  diseaseName: string;
  confidence: number;
  confidenceIntervalLow: number;
  confidenceIntervalHigh: number;
  reasoning: string[];
  riskFactors: string[];
  recommendations: string[];
  aiExplanation: string;
}

export interface OptimizedAIServiceConfig {
  enableCache: boolean;
  enableRateLimit: boolean;
  enableUsageTracking: boolean;
  maxRetries: number;
  retryDelay: number;
}

export class OptimizedAIService {
  private static readonly DEFAULT_CONFIG: OptimizedAIServiceConfig = {
    enableCache: true,
    enableRateLimit: true,
    enableUsageTracking: true,
    maxRetries: 3,
    retryDelay: 1000,
  };

  /**
   * Analyze symptoms with AI using optimized approach
   */
  static async analyzeSymptomsWithAI(
    input: AIPredictionInput,
    userId: string,
    config: Partial<OptimizedAIServiceConfig> = {}
  ): Promise<AIPrediction[]> {
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config };
    const startTime = Date.now(); // Track processing start time

    try {
      // 1. Check cache first
      if (finalConfig.enableCache) {
        const cached = AICache.getCachedPrediction(
          input.symptoms,
          input.age,
          input.gender,
          input.duration,
          input.severity
        );

        if (cached) {
          console.log("Cache hit for AI prediction");
          return cached.predictions;
        }
      }

      // 2. Check rate limits
      if (finalConfig.enableRateLimit) {
        const rateLimitResult = await RateLimiter.checkAIDiagnosisLimit(userId);
        if (!rateLimitResult.allowed) {
          throw new Error(
            `Rate limit exceeded. Try again in ${rateLimitResult.retryAfter} seconds.`
          );
        }
      }

      // 3. Check usage limits
      if (finalConfig.enableUsageTracking) {
        const estimatedTokens = AIUsageTracker.estimateTokens(
          input.symptoms,
          input.additionalNotes
        );

        const usageCheck = await AIUsageTracker.canMakeRequest(
          userId,
          estimatedTokens
        );
        if (!usageCheck.allowed) {
          throw new Error(`Usage limit exceeded: ${usageCheck.reason}`);
        }
      }

      // 4. Get optimized disease context
      const diseasesContext = await AICache.getRelevantDiseases(input.symptoms);

      // 5. Create optimized prompt
      const prompt = this.createOptimizedPrompt(input, diseasesContext);

      // 6. Make AI request with retry logic
      const predictions = await this.makeAIRequestWithRetry(
        prompt,
        finalConfig.maxRetries,
        finalConfig.retryDelay
      );

      // 7. Process and validate predictions
      const processedPredictions = await this.processPredictions(
        predictions,
        input
      );

      // 8. Cache the result
      if (finalConfig.enableCache && processedPredictions.length > 0) {
        AICache.setCachedPrediction(
          input.symptoms,
          input.age,
          input.gender,
          input.duration,
          input.severity,
          processedPredictions
        );
      }

      // 9. Record usage
      if (finalConfig.enableUsageTracking) {
        const tokensUsed = this.estimateTokensUsed(prompt, predictions);
        await AIUsageTracker.recordUsage({
          userId,
          sessionId: undefined, // Don't pass invalid session ID
          tokensUsed,
          cost: AIUsageTracker.calculateCost(tokensUsed),
          model: "gpt-3.5-turbo",
          endpoint: "ai-diagnosis",
          processingTime: Date.now() - startTime,
          success: true,
          timestamp: new Date(),
        });
      }

      return processedPredictions;
    } catch (error) {
      console.error("Optimized AI analysis failed:", error);

      // Return fallback predictions
      return this.generateFallbackPredictions(input);
    }
  }

  /**
   * Create optimized prompt with reduced token usage
   */
  private static createOptimizedPrompt(
    input: AIPredictionInput,
    diseasesContext: string
  ): string {
    return `Medical AI Analysis

Patient: ${input.age}y ${input.gender}, ${input.duration} duration, ${
      input.severity
    } severity
Symptoms: ${input.symptoms.join(", ")}
${input.additionalNotes ? `Notes: ${input.additionalNotes}` : ""}

Diseases: ${diseasesContext}

Analyze and return JSON:
{
  "predictions": [
    {
      "diseaseName": "exact name from diseases list",
      "confidence": 0.85,
      "reasoning": ["reason1", "reason2"],
      "riskFactors": ["factor1"],
      "recommendations": ["action1"]
    }
  ],
  "aiExplanation": "brief explanation"
}

Guidelines:
- Only use diseases from the list above
- Confidence 0.1-0.95
- Max 3 predictions
- Be concise but accurate
- Include age/gender considerations`;
  }

  /**
   * Make AI request with retry logic
   */
  private static async makeAIRequestWithRetry(
    prompt: string,
    maxRetries: number,
    retryDelay: number
  ): Promise<{
    content: string;
    usage: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  }> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content:
                "You are a medical AI. Respond only with valid JSON as requested.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.3,
          max_tokens: 1500, // Reduced from 2000
        });

        const response = completion.choices[0]?.message?.content;
        if (!response) {
          throw new Error("No response from OpenAI");
        }

        return JSON.parse(response);
      } catch (error) {
        lastError = error as Error;
        console.warn(`AI request attempt ${attempt} failed:`, error);

        if (attempt < maxRetries) {
          // Wait before retry with exponential backoff
          const delay = retryDelay * Math.pow(2, attempt - 1);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error("All AI request attempts failed");
  }

  /**
   * Process and validate AI predictions
   */
  private static async processPredictions(
    aiResponse: {
      content: string;
      usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
      };
      predictions?: Array<{
        diseaseName: string;
        confidence: number;
        confidenceIntervalLow: number;
        confidenceIntervalHigh: number;
        reasoning: string[];
        riskFactors: string[];
        recommendations: string[];
        aiExplanation: string;
      }>;
      aiExplanation?: string;
    },
    input: AIPredictionInput
  ): Promise<AIPrediction[]> {
    console.log("AI Response structure:", JSON.stringify(aiResponse, null, 2));

    if (!aiResponse.predictions || !Array.isArray(aiResponse.predictions)) {
      console.error("Invalid response structure from AI:", aiResponse);
      throw new Error("Invalid response structure from AI");
    }

    // Get disease IDs from database
    const diseaseData = await db.select().from(diseases);
    const diseaseMap = new Map(
      diseaseData.map((d) => [d.name.toLowerCase(), d.id])
    );

    const predictions: AIPrediction[] = [];

    for (const prediction of aiResponse.predictions.slice(0, 3)) {
      // Limit to 3 predictions
      let diseaseId = diseaseMap.get(prediction.diseaseName.toLowerCase());

      // Try to find disease by partial name match if exact match fails
      if (!diseaseId) {
        const diseaseName = prediction.diseaseName.toLowerCase();
        for (const [dbName, id] of diseaseMap.entries()) {
          if (
            dbName.includes(diseaseName.split(" ")[0]) ||
            diseaseName.includes(dbName.split(" ")[0])
          ) {
            diseaseId = id;
            console.log(
              `Found disease by partial match: ${prediction.diseaseName} -> ${dbName}`
            );
            break;
          }
        }
      }

      if (!diseaseId) {
        console.warn(`Disease not found: ${prediction.diseaseName}`);
        // Create a fallback prediction with a generic disease ID
        diseaseId = diseaseData[0]?.id || "fallback-disease-id";
      }

      const confidence = Math.max(
        0.1,
        Math.min(0.95, prediction.confidence || 0.5)
      );
      const interval = 0.1;

      predictions.push({
        diseaseId,
        diseaseName: prediction.diseaseName,
        confidence,
        confidenceIntervalLow: Math.max(0, confidence - interval),
        confidenceIntervalHigh: Math.min(1, confidence + interval),
        reasoning: Array.isArray(prediction.reasoning)
          ? prediction.reasoning.slice(0, 3) // Limit reasoning points
          : [prediction.reasoning || "AI analysis"],
        riskFactors: Array.isArray(prediction.riskFactors)
          ? prediction.riskFactors.slice(0, 2) // Limit risk factors
          : [prediction.riskFactors || "Based on symptoms"],
        recommendations: Array.isArray(prediction.recommendations)
          ? prediction.recommendations.slice(0, 3) // Limit recommendations
          : [prediction.recommendations || "Consult healthcare provider"],
        aiExplanation:
          prediction.aiExplanation ||
          aiResponse.aiExplanation ||
          this.generateFallbackExplanation(input, prediction.diseaseName),
      });
    }

    const sortedPredictions = predictions.sort(
      (a, b) => b.confidence - a.confidence
    );

    // If no predictions were generated, create a fallback
    if (sortedPredictions.length === 0) {
      console.warn("No predictions generated, creating fallback");
      const fallbackDisease = diseaseData[0];
      if (fallbackDisease) {
        sortedPredictions.push({
          diseaseId: fallbackDisease.id,
          diseaseName: fallbackDisease.name,
          confidence: 0.3,
          confidenceIntervalLow: 0.2,
          confidenceIntervalHigh: 0.4,
          reasoning: [
            "Unable to match symptoms to specific conditions",
            "General symptoms suggest common condition",
          ],
          riskFactors: ["Symptom presentation"],
          recommendations: [
            "Monitor symptoms",
            "Consult healthcare provider if symptoms worsen",
          ],
          aiExplanation:
            "AI analysis was unable to generate specific predictions",
        });
      }
    }

    return sortedPredictions;
  }

  /**
   * Generate fallback explanation when AI doesn't provide one
   */
  private static generateFallbackExplanation(
    input: AIPredictionInput,
    diseaseName: string
  ): string {
    const age = input.age;
    const gender = input.gender;
    const duration = input.duration;
    const severity = input.severity;
    const symptoms = input.symptoms.join(", ");

    return `The patient, a ${age}-year-old ${gender} with a ${duration} history of ${severity} ${symptoms}, is likely experiencing ${diseaseName}. Further evaluation may be needed for accurate diagnosis.`;
  }

  /**
   * Generate fallback predictions when AI fails
   */
  private static async generateFallbackPredictions(
    input: AIPredictionInput
  ): Promise<AIPrediction[]> {
    console.log("Using fallback prediction system");

    try {
      const diseaseData = await db.select().from(diseases);
      const commonSymptoms = [
        "fever",
        "headache",
        "cough",
        "fatigue",
        "nausea",
      ];

      const matchingDiseases = diseaseData
        .filter(() =>
          commonSymptoms.some((symptom) =>
            input.symptoms.some((inputSymptom) =>
              inputSymptom.toLowerCase().includes(symptom)
            )
          )
        )
        .slice(0, 3);

      return matchingDiseases.map((disease, index) => {
        const confidence = 0.6 - index * 0.1;
        const interval = 0.1;

        return {
          diseaseId: disease.id,
          diseaseName: disease.name,
          confidence,
          confidenceIntervalLow: Math.max(0, confidence - interval),
          confidenceIntervalHigh: Math.min(1, confidence + interval),
          reasoning: [`Symptoms match common patterns for ${disease.name}`],
          riskFactors: ["Based on reported symptoms"],
          recommendations: [
            "Consult healthcare provider for proper diagnosis",
            "Monitor symptoms and seek medical attention if they worsen",
          ],
          aiExplanation: "Fallback analysis due to AI service unavailability",
        };
      });
    } catch (error) {
      console.error("Fallback prediction failed:", error);
      throw new Error("Unable to generate predictions");
    }
  }

  /**
   * Estimate tokens used in request
   */
  private static estimateTokensUsed(
    prompt: string,
    response: {
      content: string;
      usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
      };
    }
  ): number {
    const promptTokens = Math.ceil(prompt.length / 4);
    const responseTokens = Math.ceil(JSON.stringify(response).length / 4);
    return promptTokens + responseTokens;
  }

  /**
   * Test OpenAI connection
   */
  static async testOpenAIConnection(): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: "Hello",
          },
        ],
        max_tokens: 10,
      });

      if (completion.choices[0]?.message?.content) {
        return {
          success: true,
          message: "OpenAI connection successful",
        };
      } else {
        return {
          success: false,
          message: "No response from OpenAI",
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `OpenAI connection failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  /**
   * Get service statistics
   */
  static getServiceStats(): {
    cache: {
      size: number;
      hitRate: number;
    };
    rateLimit: {
      totalKeys: number;
      activeWindows: number;
      expiredWindows: number;
    };
    usage: {
      totalRequests: number;
      totalTokens: number;
      averageResponseTime: number;
    };
  } {
    return {
      cache: AICache.getCacheStats(),
      rateLimit: RateLimiter.getStats(),
      usage: {
        totalRequests: 0, // TODO: Implement actual tracking
        totalTokens: 0, // TODO: Implement actual tracking
        averageResponseTime: 0, // TODO: Implement actual tracking
      },
    };
  }
}

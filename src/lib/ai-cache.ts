import { db } from "@/db";
import { diseases } from "@/db/schema";
import { ilike, or } from "drizzle-orm";

export interface CachedPrediction {
  id: string;
  symptoms: string[];
  age: number;
  gender: string;
  duration: string;
  severity: string;
  predictions: Array<{
    diseaseId: string;
    diseaseName: string;
    confidence: number;
    confidenceIntervalLow: number;
    confidenceIntervalHigh: number;
    reasoning: string[];
    riskFactors: string[];
    recommendations: string[];
    aiExplanation: string;
  }>;
  createdAt: Date;
  expiresAt: Date;
}

export class AICache {
  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private static readonly MAX_CACHE_SIZE = 1000; // Maximum cached predictions
  private static cache = new Map<string, CachedPrediction>();

  /**
   * Generate cache key from input parameters
   */
  private static generateCacheKey(
    symptoms: string[],
    age: number,
    gender: string,
    duration: string,
    severity: string
  ): string {
    const normalizedSymptoms = symptoms
      .map((s) => s.toLowerCase().trim())
      .sort()
      .join(",");

    return `${normalizedSymptoms}-${age}-${gender}-${duration}-${severity}`;
  }

  /**
   * Get cached prediction if available and not expired
   */
  static getCachedPrediction(
    symptoms: string[],
    age: number,
    gender: string,
    duration: string,
    severity: string
  ): CachedPrediction | null {
    const key = this.generateCacheKey(
      symptoms,
      age,
      gender,
      duration,
      severity
    );
    const cached = this.cache.get(key);

    if (!cached) {
      return null;
    }

    // Check if cache has expired
    if (new Date() > cached.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return cached;
  }

  /**
   * Cache a prediction result
   */
  static setCachedPrediction(
    symptoms: string[],
    age: number,
    gender: string,
    duration: string,
    severity: string,
    predictions: Array<{
      diseaseId: string;
      diseaseName: string;
      confidence: number;
      confidenceIntervalLow: number;
      confidenceIntervalHigh: number;
      reasoning: string[];
      riskFactors: string[];
      recommendations: string[];
      aiExplanation: string;
    }>
  ): void {
    const key = this.generateCacheKey(
      symptoms,
      age,
      gender,
      duration,
      severity
    );

    // Clean up expired entries and enforce size limit
    this.cleanupCache();

    const cached: CachedPrediction = {
      id: key,
      symptoms,
      age,
      gender,
      duration,
      severity,
      predictions,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + this.CACHE_DURATION),
    };

    this.cache.set(key, cached);
  }

  /**
   * Clean up expired cache entries and enforce size limits
   */
  private static cleanupCache(): void {
    const now = new Date();

    // Remove expired entries
    for (const [key, value] of this.cache.entries()) {
      if (now > value.expiresAt) {
        this.cache.delete(key);
      }
    }

    // Enforce size limit by removing oldest entries
    if (this.cache.size > this.MAX_CACHE_SIZE) {
      const entries = Array.from(this.cache.entries());
      entries.sort(
        (a, b) => a[1].createdAt.getTime() - b[1].createdAt.getTime()
      );

      const toRemove = entries.slice(0, entries.length - this.MAX_CACHE_SIZE);
      toRemove.forEach(([key]) => this.cache.delete(key));
    }
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
  } {
    return {
      size: this.cache.size,
      maxSize: this.MAX_CACHE_SIZE,
      hitRate: 0, // TODO: Implement hit rate tracking
    };
  }

  /**
   * Clear all cache entries
   */
  static clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get relevant diseases for symptoms (optimized version)
   */
  static async getRelevantDiseases(symptoms: string[]): Promise<string> {
    try {
      // Create search terms from symptoms
      const searchTerms = symptoms.map((symptom) =>
        symptom.toLowerCase().trim()
      );

      // Query diseases that match any of the symptoms
      const diseaseData = await db
        .select()
        .from(diseases)
        .where(
          or(
            ...searchTerms.map((term) => ilike(diseases.name, `%${term}%`)),
            ...searchTerms.map((term) =>
              ilike(diseases.description, `%${term}%`)
            )
          )
        )
        .limit(50); // Limit to 50 most relevant diseases

      if (diseaseData.length === 0) {
        // Fallback to common diseases if no matches
        const commonDiseases = await db.select().from(diseases).limit(20);

        return commonDiseases
          .map(
            (disease) =>
              `- ${disease.name} (${disease.icdCode || "N/A"}): ${
                disease.description || "No description"
              }`
          )
          .join("\n");
      }

      return diseaseData
        .map(
          (disease) =>
            `- ${disease.name} (${disease.icdCode || "N/A"}): ${
              disease.description || "No description"
            }`
        )
        .join("\n");
    } catch (error) {
      console.error("Failed to fetch relevant diseases:", error);
      return "Disease data not available";
    }
  }
}

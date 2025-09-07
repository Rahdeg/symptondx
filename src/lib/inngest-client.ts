import { Inngest } from "inngest";

// Create Inngest client
export const inngest = new Inngest({
  id: "symptomdx-ai",
  name: "SymptomDx AI Service",
});

// Event types
export interface AIDiagnosisRequestedEvent {
  name: "ai/diagnosis.requested";
  data: {
    sessionId: string;
    userId: string;
    symptoms: string[];
    age: number;
    gender: string;
    duration: string;
    severity: string;
    additionalNotes?: string;
    priority: "normal" | "high" | "emergency";
  };
}

export interface AIDiagnosisCompletedEvent {
  name: "ai/diagnosis.completed";
  data: {
    sessionId: string;
    userId: string;
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
    modelVersion: string;
    tokensUsed: number;
    cost: number;
    processingTime: number;
  };
}

export interface AIDiagnosisFailedEvent {
  name: "ai/diagnosis.failed";
  data: {
    sessionId: string;
    userId: string;
    error: string;
    retryCount: number;
    maxRetries: number;
  };
}

export interface UsageLimitExceededEvent {
  name: "ai/usage.limit.exceeded";
  data: {
    userId: string;
    limitType: "daily" | "monthly" | "per_request";
    currentUsage: number;
    limit: number;
    sessionId?: string;
  };
}

// Export event types for use in other files
export type InngestEvent =
  | AIDiagnosisRequestedEvent
  | AIDiagnosisCompletedEvent
  | AIDiagnosisFailedEvent
  | UsageLimitExceededEvent;

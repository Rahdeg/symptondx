import {
  createTRPCRouter,
  baseProcedure,
  protectedProcedure,
} from "@/trpc/init";
import { testOpenAIConnection } from "@/lib/openai-service";

export const aiRouter = createTRPCRouter({
  // Simple status endpoint
  status: baseProcedure.query(async () => {
    return {
      status: "active",
      message: "AI services are available for symptom analysis",
      provider: "openai",
    };
  }),

  // Test endpoint for AI connectivity
  testConnection: protectedProcedure.query(async () => {
    try {
      // Test actual OpenAI connection
      const result = await testOpenAIConnection();
      return {
        success: result.success,
        message: result.message,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        message: "AI services are not available",
        error: String(error),
      };
    }
  }),

  // Get available AI models
  getAvailableModels: protectedProcedure.query(async () => {
    return {
      models: [
        {
          id: "gpt-3.5-turbo",
          name: "GPT-4",
          description: "Advanced AI model for complex medical analysis",
          capabilities: [
            "symptom_analysis",
            "differential_diagnosis",
            "medical_reasoning",
          ],
        },
        {
          id: "gpt-3.5-turbo",
          name: "GPT-3.5 Turbo",
          description: "Fast AI model for basic symptom assessment",
          capabilities: ["symptom_analysis", "basic_triage"],
        },
      ],
    };
  }),
});

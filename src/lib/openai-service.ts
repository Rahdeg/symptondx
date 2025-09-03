import OpenAI from "openai";
import { z } from "zod";
import { db } from "@/db";
import { diseases } from "@/db/schema";

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

// Fetch diseases from database for context
async function getDiseasesForContext(): Promise<string> {
  try {
    const diseaseData = await db.select().from(diseases);
    return diseaseData
      .map(
        (disease) =>
          `- ${disease.name} (${disease.icdCode || "N/A"}): ${
            disease.description || "No description"
          }`
      )
      .join("\n");
  } catch (error) {
    console.error("Failed to fetch diseases from database:", error);
    return "Disease data not available";
  }
}

// Create medical analysis prompt
function createMedicalPrompt(
  input: AIPredictionInput,
  diseasesContext: string
): string {
  return `You are a medical AI assistant specializing in symptom analysis and differential diagnosis. 

PATIENT INFORMATION:
- Age: ${input.age} years
- Gender: ${input.gender}
- Symptoms: ${input.symptoms.join(", ")}
- Duration: ${input.duration}
- Severity: ${input.severity}
- Additional Notes: ${input.additionalNotes || "None"}

AVAILABLE DISEASES IN DATABASE:
${diseasesContext}

TASK:
Analyze the patient's symptoms and provide a differential diagnosis with the following requirements:

1. **Top 3-5 most likely conditions** from the available diseases
2. **Confidence scores** (0.0 to 1.0) for each condition
3. **Medical reasoning** for each prediction
4. **Risk factors** based on patient demographics and symptoms
5. **Specific recommendations** for each condition
6. **Overall AI explanation** of the analysis

RESPONSE FORMAT (JSON):
{
  "predictions": [
    {
      "diseaseName": "Exact disease name from database",
      "confidence": 0.85,
      "reasoning": ["Reason 1", "Reason 2"],
      "riskFactors": ["Risk factor 1", "Risk factor 2"],
      "recommendations": ["Recommendation 1", "Recommendation 2"]
    }
  ],
  "aiExplanation": "Overall explanation of the analysis and approach"
}

IMPORTANT GUIDELINES:
- Only suggest diseases that exist in the provided database
- Use exact disease names as they appear in the database
- Provide realistic confidence scores based on symptom match
- Include age and gender considerations in reasoning
- Consider symptom severity and duration
- Provide actionable medical recommendations
- Always emphasize that this is for informational purposes only
- Recommend professional medical consultation for proper diagnosis

MEDICAL DISCLAIMER:
This analysis is for informational purposes only and should not replace professional medical advice, diagnosis, or treatment. Always consult with a qualified healthcare provider.`;
}

// Main AI prediction function
export async function analyzeSymptomsWithAI(
  input: AIPredictionInput
): Promise<AIPrediction[]> {
  try {
    // Get diseases context from database
    const diseasesContext = await getDiseasesForContext();

    // Create the medical prompt
    const prompt = createMedicalPrompt(input, diseasesContext);

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a medical AI assistant. Always respond with valid JSON format as requested. Be precise and medically accurate.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3, // Lower temperature for more consistent medical analysis
      max_tokens: 2000,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error("No response from OpenAI");
    }

    // Parse the JSON response
    let aiResponse;
    try {
      aiResponse = JSON.parse(response);
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", parseError);
      throw new Error("Invalid response format from AI");
    }

    // Validate and process the response
    if (!aiResponse.predictions || !Array.isArray(aiResponse.predictions)) {
      throw new Error("Invalid response structure from AI");
    }

    // Get disease IDs from database
    const diseaseData = await db.select().from(diseases);
    const diseaseMap = new Map(diseaseData.map((d) => [d.name, d.id]));

    // Process predictions
    const predictions: AIPrediction[] = [];

    for (const prediction of aiResponse.predictions) {
      const diseaseId = diseaseMap.get(prediction.diseaseName);
      if (!diseaseId) {
        console.warn(
          `Disease not found in database: ${prediction.diseaseName}`
        );
        continue;
      }

      // Calculate confidence interval
      const confidence = Math.max(
        0.1,
        Math.min(0.95, prediction.confidence || 0.5)
      );
      const interval = 0.1;
      const confidenceIntervalLow = Math.max(0, confidence - interval);
      const confidenceIntervalHigh = Math.min(1, confidence + interval);

      predictions.push({
        diseaseId,
        diseaseName: prediction.diseaseName,
        confidence,
        confidenceIntervalLow,
        confidenceIntervalHigh,
        reasoning: Array.isArray(prediction.reasoning)
          ? prediction.reasoning
          : [prediction.reasoning || "AI analysis"],
        riskFactors: Array.isArray(prediction.riskFactors)
          ? prediction.riskFactors
          : [prediction.riskFactors || "Based on symptoms"],
        recommendations: Array.isArray(prediction.recommendations)
          ? prediction.recommendations
          : [prediction.recommendations || "Consult healthcare provider"],
        aiExplanation:
          aiResponse.aiExplanation ||
          "AI-powered analysis based on symptom patterns and medical knowledge",
      });
    }

    // Sort by confidence (highest first)
    return predictions.sort((a, b) => b.confidence - a.confidence);
  } catch (error) {
    console.error("OpenAI analysis failed:", error);

    // Fallback to basic analysis if AI fails
    return await generateFallbackPredictions(input);
  }
}

// Fallback function when OpenAI fails
async function generateFallbackPredictions(
  input: AIPredictionInput
): Promise<AIPrediction[]> {
  console.log("Using fallback prediction system");

  try {
    const diseaseData = await db.select().from(diseases);

    // Simple symptom matching fallback
    const commonSymptoms = ["fever", "headache", "cough", "fatigue", "nausea"];
    const matchingDiseases = diseaseData
      .filter((disease) =>
        commonSymptoms.some((symptom) =>
          input.symptoms.some((inputSymptom) =>
            inputSymptom.toLowerCase().includes(symptom)
          )
        )
      )
      .slice(0, 3);

    return matchingDiseases.map((disease, index) => {
      const confidence = 0.6 - index * 0.1; // Decreasing confidence
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
    console.error("Fallback prediction also failed:", error);
    throw new Error("Unable to generate predictions");
  }
}

// Test OpenAI connection
export async function testOpenAIConnection(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: "Hello, are you working?",
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

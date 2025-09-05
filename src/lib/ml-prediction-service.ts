import { z } from "zod";
import { db } from "@/db";
import { diseases } from "@/db/schema";

// Mock disease database (fallback)
const mockDiseases = [
  {
    id: "1",
    name: "Common Cold",
    description:
      "A viral infection of the upper respiratory tract, typically causing symptoms like runny nose, sneezing, and mild fever.",
    icdCode: "J00",
    severityLevel: "mild",
    isCommon: true,
    prevalence: 0.15,
    treatmentInfo:
      "Rest, hydration, over-the-counter medications for symptom relief.",
    preventionInfo:
      "Frequent hand washing, avoiding close contact with sick individuals.",
  },
  {
    id: "2",
    name: "Influenza (Flu)",
    description:
      "A contagious respiratory illness caused by influenza viruses, with symptoms including fever, body aches, and fatigue.",
    icdCode: "J10",
    severityLevel: "moderate",
    isCommon: true,
    prevalence: 0.08,
    treatmentInfo:
      "Antiviral medications, rest, hydration, and symptom management.",
    preventionInfo: "Annual flu vaccination, good hygiene practices.",
  },
  {
    id: "3",
    name: "Migraine",
    description:
      "A neurological condition characterized by severe headaches, often accompanied by nausea, vomiting, and sensitivity to light.",
    icdCode: "G43",
    severityLevel: "moderate",
    isCommon: true,
    prevalence: 0.12,
    treatmentInfo:
      "Pain relievers, triptans, preventive medications, lifestyle modifications.",
    preventionInfo:
      "Identify and avoid triggers, maintain regular sleep schedule, stress management.",
  },
  {
    id: "4",
    name: "Gastroenteritis",
    description:
      "Inflammation of the stomach and intestines, commonly caused by viral or bacterial infections, leading to diarrhea and vomiting.",
    icdCode: "K59.1",
    severityLevel: "moderate",
    isCommon: true,
    prevalence: 0.06,
    treatmentInfo:
      "Fluid replacement, electrolyte solutions, rest, and dietary modifications.",
    preventionInfo:
      "Proper food handling, hand hygiene, safe water consumption.",
  },
  {
    id: "5",
    name: "Pneumonia",
    description:
      "Infection of the lungs that can cause inflammation and fluid buildup, leading to breathing difficulties and chest pain.",
    icdCode: "J18",
    severityLevel: "severe",
    isCommon: true,
    prevalence: 0.03,
    treatmentInfo:
      "Antibiotics (if bacterial), antiviral medications (if viral), supportive care.",
    preventionInfo:
      "Vaccination, good hygiene, avoiding smoking, managing chronic conditions.",
  },
  {
    id: "6",
    name: "Hypertension",
    description:
      "High blood pressure, a chronic condition that can lead to serious health complications if left untreated.",
    icdCode: "I10",
    severityLevel: "moderate",
    isCommon: true,
    prevalence: 0.25,
    treatmentInfo:
      "Lifestyle modifications, antihypertensive medications, regular monitoring.",
    preventionInfo:
      "Healthy diet, regular exercise, weight management, stress reduction.",
  },
  {
    id: "7",
    name: "Diabetes Type 2",
    description:
      "A chronic condition where the body cannot effectively use insulin, leading to high blood sugar levels.",
    icdCode: "E11",
    severityLevel: "severe",
    isCommon: true,
    prevalence: 0.09,
    treatmentInfo:
      "Lifestyle changes, oral medications, insulin therapy, blood sugar monitoring.",
    preventionInfo:
      "Healthy diet, regular exercise, weight management, regular health checkups.",
  },
  {
    id: "8",
    name: "Anxiety Disorder",
    description:
      "A mental health condition characterized by excessive worry, fear, and physical symptoms like rapid heartbeat.",
    icdCode: "F41",
    severityLevel: "moderate",
    isCommon: true,
    prevalence: 0.18,
    treatmentInfo:
      "Therapy, medications, lifestyle modifications, stress management techniques.",
    preventionInfo:
      "Stress management, regular exercise, healthy sleep habits, social support.",
  },
];

// Symptom to disease mapping (using disease names instead of IDs)
const symptomDiseaseMapping: Record<string, string[]> = {
  fever: ["Common Cold", "Influenza (Flu)", "Pneumonia"],
  headache: ["Migraine", "Influenza (Flu)", "Common Cold"],
  cough: ["Common Cold", "Influenza (Flu)", "Pneumonia"],
  fatigue: ["Influenza (Flu)", "Diabetes Type 2", "Anxiety Disorder"],
  nausea: ["Gastroenteritis", "Migraine", "Influenza (Flu)"],
  vomiting: ["Gastroenteritis", "Migraine", "Influenza (Flu)"],
  diarrhea: ["Gastroenteritis"],
  "chest pain": ["Pneumonia", "Hypertension"],
  "shortness of breath": ["Pneumonia", "Hypertension", "Diabetes Type 2"],
  dizziness: ["Hypertension", "Anxiety Disorder", "Migraine"],
  "muscle aches": ["Influenza (Flu)", "Common Cold"],
  "joint pain": ["Influenza (Flu)", "Common Cold"],
  rash: ["Common Cold", "Influenza (Flu)"],
  "sore throat": ["Common Cold", "Influenza (Flu)"],
  "runny nose": ["Common Cold", "Influenza (Flu)"],
  congestion: ["Common Cold", "Influenza (Flu)"],
  "loss of appetite": ["Gastroenteritis", "Influenza (Flu)", "Diabetes Type 2"],
  "weight loss": ["Diabetes Type 2", "Gastroenteritis"],
  insomnia: ["Anxiety Disorder", "Migraine"],
  anxiety: ["Anxiety Disorder"],
  depression: ["Anxiety Disorder"],
  "memory problems": ["Anxiety Disorder", "Hypertension"],
  "vision changes": ["Diabetes Type 2", "Hypertension"],
  "hearing problems": ["Common Cold", "Influenza (Flu)"],
  "abdominal pain": ["Gastroenteritis", "Diabetes Type 2"],
  "back pain": ["Common Cold", "Influenza (Flu)"],
  "neck pain": ["Common Cold", "Influenza (Flu)", "Migraine"],
};

// Input schema for ML prediction
export const mlPredictionInputSchema = z.object({
  symptoms: z.array(z.string()),
  age: z.number(),
  gender: z.enum(["male", "female", "other"]),
  duration: z.string(),
  severity: z.enum(["mild", "moderate", "severe"]),
  additionalNotes: z.string().optional(),
});

export type MLPredictionInput = z.infer<typeof mlPredictionInputSchema>;

export interface MLPrediction {
  diseaseId: string;
  confidence: number;
  confidenceIntervalLow: number;
  confidenceIntervalHigh: number;
  reasoning: string[];
  riskFactors: string[];
  recommendations: string[];
}

// Disease type for internal use
interface DiseaseData {
  id: string;
  name: string;
  description: string | null;
  icdCode: string | null;
  severityLevel: string;
  treatmentInfo: string | null;
  preventionInfo: string | null;
}

// Real ML prediction function
export async function predictDiseases(
  input: MLPredictionInput
): Promise<MLPrediction[]> {
  console.log("🔍 ML Prediction Input:", input);

  // Simulate processing time
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Fetch diseases from database
  let diseaseData;
  try {
    diseaseData = await db.select().from(diseases);
    console.log("📊 Fetched diseases from database:", diseaseData.length);
  } catch (error) {
    console.error(
      "Failed to fetch diseases from database, using mock data:",
      error
    );
    diseaseData = mockDiseases;
  }

  // Get potential diseases based on symptoms
  const potentialDiseases = new Set<string>();

  input.symptoms.forEach((symptom) => {
    const diseases = symptomDiseaseMapping[symptom.toLowerCase()] || [];
    console.log(`🔍 Symptom "${symptom}" maps to diseases:`, diseases);
    diseases.forEach((diseaseName) => potentialDiseases.add(diseaseName));
  });

  console.log("🎯 Potential diseases found:", Array.from(potentialDiseases));

  // If no specific matches, add some common diseases
  if (potentialDiseases.size === 0) {
    console.log("⚠️ No specific matches found, adding common diseases");
    potentialDiseases.add("Common Cold");
    potentialDiseases.add("Influenza (Flu)");
  }

  // Generate predictions with mock confidence scores
  const predictions: MLPrediction[] = [];
  const diseaseNames = Array.from(potentialDiseases);

  // Sort by relevance (mock algorithm)
  const sortedDiseases = diseaseNames.sort((a, b) => {
    // Higher prevalence = more likely (using mock prevalence for now)
    const prevalenceA =
      mockDiseases.find((md) => md.name === a)?.prevalence || 0.1;
    const prevalenceB =
      mockDiseases.find((md) => md.name === b)?.prevalence || 0.1;
    return prevalenceB - prevalenceA;
  });

  // Generate 3-5 predictions
  const numPredictions = Math.min(
    3 + Math.floor(Math.random() * 3),
    sortedDiseases.length
  );

  for (let i = 0; i < numPredictions; i++) {
    const diseaseName = sortedDiseases[i];
    const disease = diseaseData.find((d) => d.name === diseaseName);

    if (!disease) continue;

    // Calculate mock confidence based on symptom matches and other factors
    let baseConfidence = 0.3 + Math.random() * 0.4; // 30-70% base

    // Adjust based on symptom count
    baseConfidence += Math.min(input.symptoms.length * 0.05, 0.2);

    // Adjust based on severity
    if (input.severity === "severe") baseConfidence += 0.1;
    if (input.severity === "mild") baseConfidence -= 0.1;

    // Adjust based on age (some diseases are age-related)
    if (disease.name === "Hypertension" && input.age > 40)
      baseConfidence += 0.15;
    if (disease.name === "Diabetes Type 2" && input.age > 35)
      baseConfidence += 0.1;

    // Ensure confidence is within bounds
    baseConfidence = Math.max(0.1, Math.min(0.95, baseConfidence));

    // Generate confidence interval
    const interval = 0.1;
    const confidenceIntervalLow = Math.max(0, baseConfidence - interval);
    const confidenceIntervalHigh = Math.min(1, baseConfidence + interval);

    // Generate reasoning
    const reasoning = generateReasoning(input, disease);

    // Generate risk factors
    const riskFactors = generateRiskFactors(input, disease);

    // Generate recommendations
    const recommendations = generateRecommendations(disease, baseConfidence);

    predictions.push({
      diseaseId: disease.id,
      confidence: baseConfidence,
      confidenceIntervalLow,
      confidenceIntervalHigh,
      reasoning,
      riskFactors,
      recommendations,
    });
  }

  // Sort by confidence (highest first)
  const sortedPredictions = predictions.sort(
    (a, b) => b.confidence - a.confidence
  );
  console.log("🎉 Final predictions:", sortedPredictions.length, "results");
  return sortedPredictions;
}

function generateReasoning(
  input: MLPredictionInput,
  disease: DiseaseData
): string[] {
  const reasoning: string[] = [];

  // Symptom-based reasoning
  const matchingSymptoms = input.symptoms.filter((symptom) =>
    symptomDiseaseMapping[symptom.toLowerCase()]?.includes(disease.name)
  );

  if (matchingSymptoms.length > 0) {
    reasoning.push(
      `Symptoms like ${matchingSymptoms.join(
        ", "
      )} are commonly associated with ${disease.name}`
    );
  }

  // Age-based reasoning
  if (disease.name === "Hypertension" && input.age > 40) {
    reasoning.push("Age is a significant risk factor for hypertension");
  }

  if (disease.name === "Diabetes Type 2" && input.age > 35) {
    reasoning.push("Age increases the likelihood of type 2 diabetes");
  }

  // Severity-based reasoning
  if (input.severity === "severe" && disease.severityLevel === "severe") {
    reasoning.push(
      "Severe symptoms align with the typical presentation of this condition"
    );
  }

  // Duration-based reasoning
  if (input.duration.includes("day") && disease.name === "Common Cold") {
    reasoning.push(
      "Short duration is typical for viral upper respiratory infections"
    );
  }

  // Default reasoning if none specific
  if (reasoning.length === 0) {
    reasoning.push(
      `Based on the combination of symptoms and patient demographics, ${disease.name} is a possible diagnosis`
    );
  }

  return reasoning;
}

function generateRiskFactors(
  input: MLPredictionInput,
  disease: DiseaseData
): string[] {
  const riskFactors: string[] = [];

  // Age-related risk factors
  if (input.age > 65) {
    riskFactors.push("Advanced age");
  }

  if (
    input.age > 40 &&
    (disease.name === "Hypertension" || disease.name === "Diabetes Type 2")
  ) {
    riskFactors.push("Age-related risk");
  }

  // Gender-related risk factors
  if (input.gender === "female" && disease.name === "Anxiety Disorder") {
    riskFactors.push("Female gender (higher prevalence)");
  }

  // Symptom-based risk factors
  if (input.symptoms.includes("chest pain") && disease.name === "Pneumonia") {
    riskFactors.push("Respiratory symptoms");
  }

  if (
    input.symptoms.includes("shortness of breath") &&
    disease.name === "Pneumonia"
  ) {
    riskFactors.push("Breathing difficulties");
  }

  // Severity-based risk factors
  if (input.severity === "severe") {
    riskFactors.push("Severe symptom presentation");
  }

  // Default risk factors
  if (riskFactors.length === 0) {
    riskFactors.push("Symptom presentation");
    riskFactors.push("Patient demographics");
  }

  return riskFactors;
}

function generateRecommendations(
  disease: DiseaseData,
  confidence: number
): string[] {
  const recommendations: string[] = [];

  // Confidence-based recommendations
  if (confidence > 0.7) {
    recommendations.push(
      "Consider immediate consultation with a healthcare provider"
    );
  } else if (confidence > 0.5) {
    recommendations.push("Consult with your doctor for evaluation");
  } else {
    recommendations.push(
      "Monitor symptoms and consult a healthcare provider if they worsen"
    );
  }

  // Disease-specific recommendations
  if (disease.name === "Pneumonia") {
    recommendations.push(
      "Seek immediate medical attention if breathing difficulties worsen"
    );
    recommendations.push("Rest and stay hydrated");
  }

  if (disease.name === "Common Cold" || disease.name === "Influenza (Flu)") {
    recommendations.push("Get plenty of rest and stay hydrated");
    recommendations.push("Use over-the-counter medications for symptom relief");
    recommendations.push("Consider flu vaccination for future prevention");
  }

  if (disease.name === "Migraine") {
    recommendations.push("Rest in a dark, quiet room");
    recommendations.push(
      "Consider keeping a headache diary to identify triggers"
    );
  }

  if (disease.name === "Gastroenteritis") {
    recommendations.push("Stay hydrated with clear fluids");
    recommendations.push("Avoid solid foods until symptoms improve");
    recommendations.push("Practice good hand hygiene to prevent spread");
  }

  if (disease.name === "Hypertension" || disease.name === "Diabetes Type 2") {
    recommendations.push("Schedule regular health checkups");
    recommendations.push("Maintain a healthy lifestyle with diet and exercise");
  }

  if (disease.name === "Anxiety Disorder") {
    recommendations.push("Consider speaking with a mental health professional");
    recommendations.push("Practice stress management techniques");
  }

  // General recommendations
  recommendations.push("This analysis is for informational purposes only");
  recommendations.push(
    "Always consult with a healthcare provider for proper diagnosis and treatment"
  );

  return recommendations;
}

export { mockDiseases };

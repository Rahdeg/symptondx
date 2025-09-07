import { z } from "zod";
import { db } from "@/db";
import { diseases } from "@/db/schema";

// Enhanced symptom-disease mapping with more comprehensive coverage
const symptomDiseaseMapping: Record<string, string[]> = {
  // Respiratory symptoms
  fever: [
    "Common Cold",
    "Influenza (Flu)",
    "Pneumonia",
    "Bronchitis",
    "Tuberculosis",
    "Malaria",
  ],
  cough: [
    "Common Cold",
    "Influenza (Flu)",
    "Pneumonia",
    "Bronchitis",
    "Asthma",
    "Tuberculosis",
  ],
  "shortness of breath": [
    "Pneumonia",
    "Asthma",
    "Heart Failure",
    "Anxiety Disorder",
    "Bronchitis",
  ],
  "chest pain": [
    "Pneumonia",
    "Coronary Artery Disease",
    "Heart Failure",
    "Anxiety Disorder",
    "Gastroesophageal Reflux Disease (GERD)",
  ],
  "runny nose": ["Common Cold", "Influenza (Flu)", "Allergic Rhinitis"],
  congestion: ["Common Cold", "Influenza (Flu)", "Sinusitis"],
  "sore throat": ["Common Cold", "Influenza (Flu)", "Strep Throat"],
  wheezing: ["Asthma", "Bronchitis", "Heart Failure"],

  // Gastrointestinal symptoms
  nausea: [
    "Gastroenteritis",
    "Migraine",
    "Influenza (Flu)",
    "Pregnancy",
    "Anxiety Disorder",
  ],
  vomiting: [
    "Gastroenteritis",
    "Migraine",
    "Influenza (Flu)",
    "Food Poisoning",
  ],
  diarrhea: [
    "Gastroenteritis",
    "Irritable Bowel Syndrome (IBS)",
    "Food Poisoning",
    "Inflammatory Bowel Disease",
  ],
  "abdominal pain": [
    "Gastroenteritis",
    "Irritable Bowel Syndrome (IBS)",
    "Appendicitis",
    "Peptic Ulcer Disease",
    "Kidney Stones",
  ],
  "loss of appetite": [
    "Gastroenteritis",
    "Influenza (Flu)",
    "Depression",
    "Cancer",
    "Diabetes Type 2",
  ],
  heartburn: [
    "Gastroesophageal Reflux Disease (GERD)",
    "Peptic Ulcer Disease",
    "Hiatal Hernia",
  ],
  bloating: [
    "Irritable Bowel Syndrome (IBS)",
    "Gastroenteritis",
    "Lactose Intolerance",
  ],

  // Neurological symptoms
  headache: [
    "Migraine",
    "Tension Headache",
    "Influenza (Flu)",
    "Common Cold",
    "Hypertension",
    "Sinusitis",
  ],
  dizziness: [
    "Hypertension",
    "Anxiety Disorder",
    "Migraine",
    "Low Blood Sugar",
    "Dehydration",
  ],
  "memory problems": [
    "Anxiety Disorder",
    "Depression",
    "Alzheimer's Disease",
    "Sleep Deprivation",
  ],
  confusion: [
    "Dehydration",
    "Low Blood Sugar",
    "Stroke",
    "Infection",
    "Medication Side Effects",
  ],
  seizures: ["Epilepsy", "High Fever", "Head Injury", "Stroke"],

  // Musculoskeletal symptoms
  "muscle aches": [
    "Influenza (Flu)",
    "Common Cold",
    "Fibromyalgia",
    "Overexertion",
  ],
  "joint pain": [
    "Osteoarthritis",
    "Rheumatoid Arthritis",
    "Gout",
    "Influenza (Flu)",
  ],
  "back pain": [
    "Muscle Strain",
    "Osteoarthritis",
    "Herniated Disc",
    "Kidney Stones",
  ],
  "neck pain": ["Muscle Strain", "Tension Headache", "Cervical Spondylosis"],
  stiffness: [
    "Osteoarthritis",
    "Rheumatoid Arthritis",
    "Fibromyalgia",
    "Sleep Position",
  ],

  // Dermatological symptoms
  rash: [
    "Eczema (Atopic Dermatitis)",
    "Psoriasis",
    "Allergic Reaction",
    "Viral Infection",
  ],
  itching: [
    "Eczema (Atopic Dermatitis)",
    "Psoriasis",
    "Allergic Reaction",
    "Dry Skin",
  ],
  "skin redness": [
    "Eczema (Atopic Dermatitis)",
    "Psoriasis",
    "Sunburn",
    "Allergic Reaction",
  ],
  "skin scaling": [
    "Psoriasis",
    "Eczema (Atopic Dermatitis)",
    "Fungal Infection",
  ],

  // Cardiovascular symptoms
  "rapid heartbeat": [
    "Anxiety Disorder",
    "Atrial Fibrillation",
    "Hyperthyroidism",
    "Dehydration",
  ],
  "chest tightness": [
    "Anxiety Disorder",
    "Coronary Artery Disease",
    "Asthma",
    "Heart Failure",
  ],
  swelling: [
    "Heart Failure",
    "Kidney Disease",
    "Venous Insufficiency",
    "Allergic Reaction",
  ],

  // Genitourinary symptoms
  "frequent urination": [
    "Urinary Tract Infection (UTI)",
    "Diabetes Type 2",
    "Benign Prostatic Hyperplasia (BPH)",
    "Overactive Bladder",
  ],
  "painful urination": [
    "Urinary Tract Infection (UTI)",
    "Kidney Stones",
    "Sexually Transmitted Infection",
  ],
  "blood in urine": [
    "Urinary Tract Infection (UTI)",
    "Kidney Stones",
    "Bladder Cancer",
    "Kidney Disease",
  ],

  // Endocrine symptoms
  "weight loss": [
    "Diabetes Type 2",
    "Hyperthyroidism",
    "Depression",
    "Cancer",
    "Gastroenteritis",
  ],
  "weight gain": [
    "Hypothyroidism",
    "Depression",
    "Diabetes Type 2",
    "Cushing's Syndrome",
  ],
  "excessive thirst": [
    "Diabetes Type 2",
    "Diabetes Type 1",
    "Dehydration",
    "Kidney Disease",
  ],
  "excessive hunger": ["Diabetes Type 2", "Diabetes Type 1", "Hyperthyroidism"],

  // Psychiatric symptoms
  anxiety: [
    "Anxiety Disorder",
    "Hyperthyroidism",
    "Caffeine Intake",
    "Medication Side Effects",
  ],
  depression: [
    "Depression",
    "Bipolar Disorder",
    "Hypothyroidism",
    "Chronic Illness",
  ],
  insomnia: [
    "Anxiety Disorder",
    "Depression",
    "Sleep Apnea",
    "Caffeine Intake",
  ],
  "mood swings": [
    "Bipolar Disorder",
    "Premenstrual Syndrome",
    "Hormonal Changes",
  ],

  // Eye and ear symptoms
  "vision changes": [
    "Diabetes Type 2",
    "Hypertension",
    "Cataracts",
    "Glaucoma",
    "Migraine",
  ],
  "hearing problems": [
    "Ear Infection",
    "Age-related Hearing Loss",
    "Earwax Buildup",
  ],
  "eye pain": [
    "Migraine",
    "Sinusitis",
    "Glaucoma",
    "Conjunctivitis (Pink Eye)",
  ],
  "ear pain": [
    "Ear Infection",
    "Sinusitis",
    "Temporomandibular Joint Disorder",
  ],

  // General symptoms
  fatigue: [
    "Influenza (Flu)",
    "Depression",
    "Anemia",
    "Hypothyroidism",
    "Diabetes Type 2",
    "Sleep Apnea",
  ],
  weakness: ["Anemia", "Diabetes Type 2", "Heart Failure", "Chronic Illness"],
  "night sweats": ["Tuberculosis", "Menopause", "Infection", "Cancer"],
  chills: ["Influenza (Flu)", "Pneumonia", "Malaria", "Infection"],
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
  prevalence: string | null;
  treatmentInfo: string | null;
  preventionInfo: string | null;
}

// Enhanced ML prediction function with real statistical methods
export async function predictDiseases(
  input: MLPredictionInput
): Promise<MLPrediction[]> {
  console.log("🔍 ML Prediction Input:", input);

  // Simulate processing time (reduced for better UX)
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Fetch diseases from database
  let diseaseData;
  try {
    diseaseData = await db.select().from(diseases);
    console.log("📊 Fetched diseases from database:", diseaseData.length);
  } catch (error) {
    console.error("Failed to fetch diseases from database:", error);
    throw new Error("Unable to fetch disease data from database");
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

  // Generate predictions with enhanced confidence calculation
  const predictions: MLPrediction[] = [];
  const diseaseNames = Array.from(potentialDiseases);

  // Sort by relevance using enhanced algorithm
  const sortedDiseases = diseaseNames.sort((a, b) => {
    const diseaseA = diseaseData.find((d) => d.name === a);
    const diseaseB = diseaseData.find((d) => d.name === b);

    if (!diseaseA || !diseaseB) return 0;

    // Calculate relevance score based on multiple factors
    const scoreA = calculateDiseaseRelevanceScore(diseaseA, input);
    const scoreB = calculateDiseaseRelevanceScore(diseaseB, input);

    return scoreB - scoreA;
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

    // Calculate enhanced confidence using statistical methods
    const confidence = calculateEnhancedConfidence(input, disease);

    // Calculate proper confidence intervals using Wilson score interval
    const confidenceInterval = calculateConfidenceInterval(
      confidence,
      input.symptoms.length
    );

    // Generate reasoning
    const reasoning = generateReasoning(input, disease);

    // Generate risk factors
    const riskFactors = generateRiskFactors(input, disease);

    // Generate recommendations
    const recommendations = generateRecommendations(disease, confidence);

    predictions.push({
      diseaseId: disease.id,
      confidence: confidence,
      confidenceIntervalLow: confidenceInterval.low,
      confidenceIntervalHigh: confidenceInterval.high,
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

// Enhanced confidence calculation using statistical methods
function calculateEnhancedConfidence(
  input: MLPredictionInput,
  disease: DiseaseData
): number {
  // Get symptoms for this disease
  const diseaseSymptoms = getSymptomsForDisease(disease.name);
  const matchedSymptoms = input.symptoms.filter((symptom) =>
    diseaseSymptoms.includes(symptom.toLowerCase())
  );

  // Base confidence from symptom matches
  let confidence = 0.1; // Minimum confidence

  if (matchedSymptoms.length > 0) {
    // Calculate symptom coverage
    const coverage = matchedSymptoms.length / input.symptoms.length;

    // Calculate symptom specificity (how unique symptoms are to this disease)
    const specificity = calculateSymptomSpecificity(matchedSymptoms);

    // Base confidence from coverage and specificity
    confidence = Math.min(0.8, coverage * 0.6 + specificity * 0.4);
  }

  // Apply demographic adjustments
  confidence = applyDemographicAdjustments(confidence, input, disease);

  // Apply severity adjustments
  confidence = applySeverityAdjustments(confidence, input, disease);

  // Apply prevalence adjustments
  const prevalence = parseFloat(disease.prevalence || "0.1");
  confidence *= 0.8 + prevalence * 0.4;

  // Ensure confidence is within bounds
  return Math.max(0.1, Math.min(0.95, confidence));
}

function getSymptomsForDisease(diseaseName: string): string[] {
  const symptoms: string[] = [];
  for (const [symptom, diseases] of Object.entries(symptomDiseaseMapping)) {
    if (diseases.includes(diseaseName)) {
      symptoms.push(symptom);
    }
  }
  return symptoms;
}

function calculateSymptomSpecificity(symptoms: string[]): number {
  let totalSpecificity = 0;

  for (const symptom of symptoms) {
    const diseasesWithSymptom = symptomDiseaseMapping[symptom] || [];
    const specificity = 1 - (diseasesWithSymptom.length - 1) / 50; // Assuming ~50 total diseases
    totalSpecificity += Math.max(0.1, specificity);
  }

  return symptoms.length > 0 ? totalSpecificity / symptoms.length : 0;
}

function applyDemographicAdjustments(
  confidence: number,
  input: MLPredictionInput,
  disease: DiseaseData
): number {
  let adjustedConfidence = confidence;

  // Age adjustments
  if (disease.name === "Hypertension" && input.age > 40) {
    adjustedConfidence *= 1.2;
  }
  if (disease.name === "Diabetes Type 2" && input.age > 35) {
    adjustedConfidence *= 1.15;
  }
  if (disease.name === "Osteoarthritis" && input.age > 50) {
    adjustedConfidence *= 1.1;
  }

  // Gender adjustments
  if (disease.name === "Anxiety Disorder" && input.gender === "female") {
    adjustedConfidence *= 1.1;
  }
  if (
    disease.name === "Benign Prostatic Hyperplasia (BPH)" &&
    input.gender === "male"
  ) {
    adjustedConfidence *= 1.2;
  }

  return Math.min(1.0, adjustedConfidence);
}

function applySeverityAdjustments(
  confidence: number,
  input: MLPredictionInput,
  disease: DiseaseData
): number {
  let adjustedConfidence = confidence;

  // Severity level adjustments
  if (input.severity === "severe" && disease.severityLevel === "severe") {
    adjustedConfidence *= 1.2;
  } else if (input.severity === "mild" && disease.severityLevel === "mild") {
    adjustedConfidence *= 1.1;
  }

  // Duration adjustments
  if (input.duration.includes("day") && disease.name === "Common Cold") {
    adjustedConfidence *= 1.1;
  }
  if (input.duration.includes("week") && disease.name === "Influenza (Flu)") {
    adjustedConfidence *= 1.1;
  }

  return Math.min(1.0, adjustedConfidence);
}

function calculateConfidenceInterval(
  confidence: number,
  sampleSize: number
): { low: number; high: number } {
  // Use Wilson score interval for binomial proportion
  const n = sampleSize;
  const p = confidence;
  const z = 1.96; // 95% confidence interval

  if (n === 0) {
    return {
      low: Math.max(0, confidence - 0.1),
      high: Math.min(1, confidence + 0.1),
    };
  }

  const center = (p + (z * z) / (2 * n)) / (1 + (z * z) / n);
  const margin =
    (z * Math.sqrt((p * (1 - p) + (z * z) / (4 * n)) / n)) / (1 + (z * z) / n);

  return {
    low: Math.max(0, center - margin),
    high: Math.min(1, center + margin),
  };
}

function calculateDiseaseRelevanceScore(
  disease: DiseaseData,
  input: MLPredictionInput
): number {
  const diseaseSymptoms = getSymptomsForDisease(disease.name);
  const matchedSymptoms = input.symptoms.filter((symptom) =>
    diseaseSymptoms.includes(symptom.toLowerCase())
  );

  let score = 0;

  // Symptom match score
  if (matchedSymptoms.length > 0) {
    score += (matchedSymptoms.length / input.symptoms.length) * 0.6;
  }

  // Prevalence score
  const prevalence = parseFloat(disease.prevalence || "0.1");
  score += prevalence * 0.2;

  // Severity match score
  if (input.severity === disease.severityLevel) {
    score += 0.2;
  }

  return score;
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

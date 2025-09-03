import { z } from "zod";
import {
  createTRPCRouter,
  baseProcedure,
  protectedProcedure,
} from "@/trpc/init";

export const symptomsRouter = createTRPCRouter({
  // Get common symptoms list
  getCommonSymptoms: baseProcedure.query(async () => {
    return {
      symptoms: [
        { id: "fever", name: "Fever", category: "general" },
        { id: "headache", name: "Headache", category: "neurological" },
        { id: "cough", name: "Cough", category: "respiratory" },
        { id: "fatigue", name: "Fatigue", category: "general" },
        { id: "nausea", name: "Nausea", category: "gastrointestinal" },
        { id: "chest_pain", name: "Chest Pain", category: "cardiovascular" },
        {
          id: "shortness_of_breath",
          name: "Shortness of Breath",
          category: "respiratory",
        },
        { id: "dizziness", name: "Dizziness", category: "neurological" },
      ],
      categories: [
        { id: "general", name: "General" },
        { id: "neurological", name: "Neurological" },
        { id: "respiratory", name: "Respiratory" },
        { id: "gastrointestinal", name: "Gastrointestinal" },
        { id: "cardiovascular", name: "Cardiovascular" },
      ],
    };
  }),

  // Search symptoms by query
  searchSymptoms: baseProcedure
    .input(z.object({ query: z.string().min(1) }))
    .query(async ({ input }) => {
      // Mock search functionality - would normally search database
      const allSymptoms = [
        {
          id: "fever",
          name: "Fever",
          category: "general",
          description: "Elevated body temperature",
        },
        {
          id: "headache",
          name: "Headache",
          category: "neurological",
          description: "Pain in the head or neck area",
        },
        {
          id: "cough",
          name: "Cough",
          category: "respiratory",
          description: "Sudden expulsion of air from lungs",
        },
        {
          id: "fatigue",
          name: "Fatigue",
          category: "general",
          description: "Extreme tiredness or exhaustion",
        },
      ];

      const filtered = allSymptoms.filter(
        (symptom) =>
          symptom.name.toLowerCase().includes(input.query.toLowerCase()) ||
          symptom.description.toLowerCase().includes(input.query.toLowerCase())
      );

      return { symptoms: filtered };
    }),

  // Get symptom details
  getSymptomDetails: protectedProcedure
    .input(z.object({ symptomId: z.string() }))
    .query(async ({ input }) => {
      // Mock symptom details - would normally fetch from database
      const symptomDetails = {
        id: input.symptomId,
        name: "Fever",
        description:
          "Elevated body temperature, typically above 100.4°F (38°C)",
        commonCauses: [
          "Viral infections",
          "Bacterial infections",
          "Heat exhaustion",
          "Certain medications",
        ],
        relatedSymptoms: ["Chills", "Sweating", "Headache", "Fatigue"],
        whenToSeekCare: [
          "Temperature above 103°F (39.4°C)",
          "Fever lasting more than 3 days",
          "Severe symptoms accompanying fever",
        ],
      };

      return symptomDetails;
    }),
});

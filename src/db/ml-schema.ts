import {
  boolean,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
  integer,
  decimal,
  json,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { diagnosisSessions } from "./schema";

// ML-specific enums
export const modelStatusEnum = pgEnum("model_status", [
  "training",
  "active",
  "inactive",
  "deprecated",
]);

export const predictionStatusEnum = pgEnum("prediction_status", [
  "pending",
  "processing",
  "completed",
  "failed",
]);

// ML Model Management
export const mlModels = pgTable("ml_models", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 256 }).notNull(),
  version: varchar("version", { length: 50 }).notNull(),
  modelType: varchar("model_type", { length: 100 }).notNull(), // "random_forest", "neural_network", etc.
  status: modelStatusEnum("status").default("training").notNull(),
  accuracy: decimal("accuracy", { precision: 5, scale: 4 }),
  precision: decimal("precision", { precision: 5, scale: 4 }),
  recall: decimal("recall", { precision: 5, scale: 4 }),
  f1Score: decimal("f1_score", { precision: 5, scale: 4 }),
  trainingDataSize: integer("training_data_size"),
  trainingDate: timestamp("training_date"),
  deploymentDate: timestamp("deployment_date"),
  isActive: boolean("is_active").default(false),
  modelPath: varchar("model_path", { length: 500 }),
  hyperparameters: json("hyperparameters"),
  featureImportance: json("feature_importance"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Prediction Logs for monitoring and debugging
export const predictionLogs = pgTable("prediction_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id")
    .references(() => diagnosisSessions.id)
    .notNull(),
  modelId: uuid("model_id")
    .references(() => mlModels.id)
    .notNull(),
  status: predictionStatusEnum("status").default("pending").notNull(),
  inputData: json("input_data").notNull(), // Symptom vector and patient data
  outputData: json("output_data"), // Raw model predictions
  processingTime: integer("processing_time"), // milliseconds
  errorMessage: text("error_message"),
  confidenceScores: json("confidence_scores"), // All disease probabilities
  featureVector: json("feature_vector"), // Processed input features
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Training Data for continuous learning
export const trainingData = pgTable("training_data", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id").references(() => diagnosisSessions.id),
  symptoms: json("symptoms").notNull(), // Symptom IDs and severities
  patientDemographics: json("patient_demographics"), // Age, gender, etc.
  confirmedDiagnosis: varchar("confirmed_diagnosis", { length: 256 }),
  doctorValidated: boolean("doctor_validated").default(false),
  isUsedForTraining: boolean("is_used_for_training").default(false),
  dataQualityScore: decimal("data_quality_score", { precision: 3, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Model Performance Tracking
export const modelMetrics = pgTable("model_metrics", {
  id: uuid("id").primaryKey().defaultRandom(),
  modelId: uuid("model_id")
    .references(() => mlModels.id)
    .notNull(),
  metricDate: timestamp("metric_date").defaultNow(),
  totalPredictions: integer("total_predictions").default(0),
  correctPredictions: integer("correct_predictions").default(0),
  falsePositives: integer("false_positives").default(0),
  falseNegatives: integer("false_negatives").default(0),
  averageConfidence: decimal("average_confidence", { precision: 5, scale: 4 }),
  doctorAgreementRate: decimal("doctor_agreement_rate", {
    precision: 5,
    scale: 4,
  }),
  patientSatisfactionScore: decimal("patient_satisfaction_score", {
    precision: 3,
    scale: 2,
  }),
  notes: text("notes"),
});

// Feature Engineering Logs
export const featureEngineeringLogs = pgTable("feature_engineering_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id")
    .references(() => diagnosisSessions.id)
    .notNull(),
  originalSymptoms: json("original_symptoms").notNull(),
  processedFeatures: json("processed_features").notNull(),
  featureSelectionMethod: varchar("feature_selection_method", { length: 100 }),
  dimensionalityReduction: varchar("dimensionality_reduction", { length: 100 }),
  scalingMethod: varchar("scaling_method", { length: 100 }),
  missingDataHandling: varchar("missing_data_handling", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const mlModelsRelations = relations(mlModels, ({ many }) => ({
  predictionLogs: many(predictionLogs),
  modelMetrics: many(modelMetrics),
}));

export const predictionLogsRelations = relations(predictionLogs, ({ one }) => ({
  session: one(diagnosisSessions, {
    fields: [predictionLogs.sessionId],
    references: [diagnosisSessions.id],
  }),
  model: one(mlModels, {
    fields: [predictionLogs.modelId],
    references: [mlModels.id],
  }),
}));

export const trainingDataRelations = relations(trainingData, ({ one }) => ({
  session: one(diagnosisSessions, {
    fields: [trainingData.sessionId],
    references: [diagnosisSessions.id],
  }),
}));

export const modelMetricsRelations = relations(modelMetrics, ({ one }) => ({
  model: one(mlModels, {
    fields: [modelMetrics.modelId],
    references: [mlModels.id],
  }),
}));

export const featureEngineeringLogsRelations = relations(
  featureEngineeringLogs,
  ({ one }) => ({
    session: one(diagnosisSessions, {
      fields: [featureEngineeringLogs.sessionId],
      references: [diagnosisSessions.id],
    }),
  })
);

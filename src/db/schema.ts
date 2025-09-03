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

// Enums
export const userRoleEnum = pgEnum("user_role", ["patient", "doctor", "admin"]);

export const diagnosisStatusEnum = pgEnum("diagnosis_status", [
  "pending",
  "in_progress",
  "completed",
  "reviewed",
  "cancelled",
]);

export const severityLevelEnum = pgEnum("severity_level", [
  "mild",
  "moderate",
  "severe",
  "critical",
]);

export const urgencyLevelEnum = pgEnum("urgency_level", [
  "low",
  "medium",
  "high",
  "emergency",
]);

export const symptomCategoryEnum = pgEnum("symptom_category", [
  "general",
  "respiratory",
  "cardiovascular",
  "gastrointestinal",
  "neurological",
  "musculoskeletal",
  "dermatological",
  "genitourinary",
  "psychiatric",
  "endocrine",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
  "diagnosis_complete",
  "doctor_review_needed",
  "high_risk_alert",
  "follow_up_reminder",
  "system_update",
]);

// Core Tables
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkId: varchar("clerk_id", { length: 256 }).notNull().unique(),
  email: varchar("email", { length: 256 }).notNull(),
  name: varchar("name", { length: 256 }),
  role: userRoleEnum("role").notNull(),
  isActive: boolean("is_active").default(true),
  onboardingComplete: boolean("onboarding_complete").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const patients = pgTable("patients", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  dateOfBirth: timestamp("date_of_birth"),
  gender: varchar("gender", { length: 20 }),
  phoneNumber: varchar("phone_number", { length: 20 }),
  address: text("address"),
  emergencyContact: varchar("emergency_contact", { length: 256 }),
  emergencyPhone: varchar("emergency_phone", { length: 20 }),
  medicalHistory: json("medical_history").$type<string[]>(),
  allergies: json("allergies").$type<string[]>(),
  currentMedications: json("current_medications").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const doctors = pgTable("doctors", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  licenseNumber: varchar("license_number", { length: 100 }).notNull(),
  specialization: varchar("specialization", { length: 256 }),
  yearsOfExperience: integer("years_of_experience"),
  phoneNumber: varchar("phone_number", { length: 20 }),
  qualifications: text("qualifications"),
  hospitalAffiliations: text("hospital_affiliations"),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Symptom and Disease Management
export const symptomCategories = pgTable("symptom_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 256 }).notNull(),
  description: text("description"),
  category: symptomCategoryEnum("category").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const symptoms = pgTable("symptoms", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 256 }).notNull(),
  description: text("description"),
  categoryId: uuid("category_id").references(() => symptomCategories.id),
  commonName: varchar("common_name", { length: 256 }),
  severityScale: integer("severity_scale").default(10), // 1-10 scale
  isCommon: boolean("is_common").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const diseases = pgTable("diseases", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 256 }).notNull(),
  description: text("description"),
  icdCode: varchar("icd_code", { length: 20 }),
  severityLevel: severityLevelEnum("severity_level").notNull(),
  isCommon: boolean("is_common").default(false),
  prevalence: decimal("prevalence", { precision: 5, scale: 4 }), // percentage
  treatmentInfo: text("treatment_info"),
  preventionInfo: text("prevention_info"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Diagnosis System
export const diagnosisSessions = pgTable("diagnosis_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id")
    .references(() => patients.id)
    .notNull(),
  doctorId: uuid("doctor_id").references(() => doctors.id),
  status: diagnosisStatusEnum("status").default("pending").notNull(),
  urgencyLevel: urgencyLevelEnum("urgency_level").default("medium"),
  chiefComplaint: text("chief_complaint"),
  additionalInfo: text("additional_info"),
  finalDiagnosis: varchar("final_diagnosis", { length: 256 }),
  doctorNotes: text("doctor_notes"),
  confidence_score: decimal("confidence_score", { precision: 5, scale: 2 }),
  requiresDoctorReview: boolean("requires_doctor_review").default(false),
  isEmergency: boolean("is_emergency").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const reportedSymptoms = pgTable("reported_symptoms", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id")
    .references(() => diagnosisSessions.id)
    .notNull(),
  symptomId: uuid("symptom_id")
    .references(() => symptoms.id)
    .notNull(),
  severity: integer("severity").notNull(), // 1-10 scale
  duration: varchar("duration", { length: 100 }), // "2 days", "1 week", etc.
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const mlPredictions = pgTable("ml_predictions", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id")
    .references(() => diagnosisSessions.id)
    .notNull(),
  diseaseId: uuid("disease_id")
    .references(() => diseases.id)
    .notNull(),
  confidence: decimal("confidence", { precision: 5, scale: 2 }).notNull(),
  confidenceIntervalLow: decimal("confidence_interval_low", {
    precision: 5,
    scale: 2,
  }),
  confidenceIntervalHigh: decimal("confidence_interval_high", {
    precision: 5,
    scale: 2,
  }),
  modelVersion: varchar("model_version", { length: 50 }),
  reasoning: json("reasoning").$type<string[]>(),
  riskFactors: json("risk_factors").$type<string[]>(),
  recommendations: json("recommendations").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const doctorReviews = pgTable("doctor_reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id")
    .references(() => diagnosisSessions.id)
    .notNull(),
  doctorId: uuid("doctor_id")
    .references(() => doctors.id)
    .notNull(),
  finalDiagnosis: varchar("final_diagnosis", { length: 256 }).notNull(),
  confidence: integer("confidence"), // 1-10 scale
  notes: text("notes"),
  agreesWithML: boolean("agrees_with_ml"),
  recommendedActions: json("recommended_actions").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const diagnosisFeedback = pgTable("diagnosis_feedback", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id")
    .references(() => diagnosisSessions.id)
    .notNull(),
  patientId: uuid("patient_id")
    .references(() => patients.id)
    .notNull(),
  actualDiagnosis: varchar("actual_diagnosis", { length: 256 }),
  wasAccurate: boolean("was_accurate"),
  feedbackNotes: text("feedback_notes"),
  improvementSuggestions: text("improvement_suggestions"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Notifications
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  type: notificationTypeEnum("type").notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  message: text("message").notNull(),
  data: json("data"), // Additional notification data
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  patient: one(patients, {
    fields: [users.id],
    references: [patients.userId],
  }),
  doctor: one(doctors, {
    fields: [users.id],
    references: [doctors.userId],
  }),
  notifications: many(notifications),
}));

export const patientsRelations = relations(patients, ({ one, many }) => ({
  user: one(users, {
    fields: [patients.userId],
    references: [users.id],
  }),
  diagnosisSessions: many(diagnosisSessions),
  diagnosisFeedback: many(diagnosisFeedback),
}));

export const doctorsRelations = relations(doctors, ({ one, many }) => ({
  user: one(users, {
    fields: [doctors.userId],
    references: [users.id],
  }),
  diagnosisSessions: many(diagnosisSessions),
  doctorReviews: many(doctorReviews),
}));

export const symptomCategoriesRelations = relations(
  symptomCategories,
  ({ many }) => ({
    symptoms: many(symptoms),
  })
);

export const symptomsRelations = relations(symptoms, ({ one, many }) => ({
  category: one(symptomCategories, {
    fields: [symptoms.categoryId],
    references: [symptomCategories.id],
  }),
  reportedSymptoms: many(reportedSymptoms),
}));

export const diseasesRelations = relations(diseases, ({ many }) => ({
  mlPredictions: many(mlPredictions),
}));

export const diagnosisSessionsRelations = relations(
  diagnosisSessions,
  ({ one, many }) => ({
    patient: one(patients, {
      fields: [diagnosisSessions.patientId],
      references: [patients.id],
    }),
    doctor: one(doctors, {
      fields: [diagnosisSessions.doctorId],
      references: [doctors.id],
    }),
    reportedSymptoms: many(reportedSymptoms),
    mlPredictions: many(mlPredictions),
    doctorReviews: many(doctorReviews),
    diagnosisFeedback: many(diagnosisFeedback),
  })
);

export const reportedSymptomsRelations = relations(
  reportedSymptoms,
  ({ one }) => ({
    session: one(diagnosisSessions, {
      fields: [reportedSymptoms.sessionId],
      references: [diagnosisSessions.id],
    }),
    symptom: one(symptoms, {
      fields: [reportedSymptoms.symptomId],
      references: [symptoms.id],
    }),
  })
);

export const mlPredictionsRelations = relations(mlPredictions, ({ one }) => ({
  session: one(diagnosisSessions, {
    fields: [mlPredictions.sessionId],
    references: [diagnosisSessions.id],
  }),
  disease: one(diseases, {
    fields: [mlPredictions.diseaseId],
    references: [diseases.id],
  }),
}));

export const doctorReviewsRelations = relations(doctorReviews, ({ one }) => ({
  session: one(diagnosisSessions, {
    fields: [doctorReviews.sessionId],
    references: [diagnosisSessions.id],
  }),
  doctor: one(doctors, {
    fields: [doctorReviews.doctorId],
    references: [doctors.id],
  }),
}));

export const diagnosisFeedbackRelations = relations(
  diagnosisFeedback,
  ({ one }) => ({
    session: one(diagnosisSessions, {
      fields: [diagnosisFeedback.sessionId],
      references: [diagnosisSessions.id],
    }),
    patient: one(patients, {
      fields: [diagnosisFeedback.patientId],
      references: [patients.id],
    }),
  })
);

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

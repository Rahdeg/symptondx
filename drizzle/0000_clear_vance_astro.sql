CREATE TYPE "public"."diagnosis_status" AS ENUM('pending', 'in_progress', 'completed', 'reviewed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('diagnosis_complete', 'doctor_review_needed', 'high_risk_alert', 'follow_up_reminder', 'system_update');--> statement-breakpoint
CREATE TYPE "public"."severity_level" AS ENUM('mild', 'moderate', 'severe', 'critical');--> statement-breakpoint
CREATE TYPE "public"."symptom_category" AS ENUM('general', 'respiratory', 'cardiovascular', 'gastrointestinal', 'neurological', 'musculoskeletal', 'dermatological', 'genitourinary', 'psychiatric', 'endocrine');--> statement-breakpoint
CREATE TYPE "public"."urgency_level" AS ENUM('low', 'medium', 'high', 'emergency');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('patient', 'doctor', 'admin');--> statement-breakpoint
CREATE TYPE "public"."model_status" AS ENUM('training', 'active', 'inactive', 'deprecated');--> statement-breakpoint
CREATE TYPE "public"."prediction_status" AS ENUM('pending', 'processing', 'completed', 'failed');--> statement-breakpoint
CREATE TABLE "diagnosis_feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"actual_diagnosis" varchar(256),
	"was_accurate" boolean,
	"feedback_notes" text,
	"improvement_suggestions" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "diagnosis_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"doctor_id" uuid,
	"status" "diagnosis_status" DEFAULT 'pending' NOT NULL,
	"urgency_level" "urgency_level" DEFAULT 'medium',
	"chief_complaint" text,
	"additional_info" text,
	"final_diagnosis" varchar(256),
	"doctor_notes" text,
	"confidence_score" numeric(5, 2),
	"requires_doctor_review" boolean DEFAULT false,
	"is_emergency" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "diseases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(256) NOT NULL,
	"description" text,
	"icd_code" varchar(20),
	"severity_level" "severity_level" NOT NULL,
	"is_common" boolean DEFAULT false,
	"prevalence" numeric(5, 4),
	"treatment_info" text,
	"prevention_info" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "doctor_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"doctor_id" uuid NOT NULL,
	"final_diagnosis" varchar(256) NOT NULL,
	"confidence" integer,
	"notes" text,
	"agrees_with_ml" boolean,
	"recommended_actions" json,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "doctors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"license_number" varchar(100) NOT NULL,
	"specialization" varchar(256),
	"years_of_experience" integer,
	"phone_number" varchar(20),
	"is_verified" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ml_predictions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"disease_id" uuid NOT NULL,
	"confidence" numeric(5, 2) NOT NULL,
	"confidence_interval_low" numeric(5, 2),
	"confidence_interval_high" numeric(5, 2),
	"model_version" varchar(50),
	"reasoning" json,
	"risk_factors" json,
	"recommendations" json,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "notification_type" NOT NULL,
	"title" varchar(256) NOT NULL,
	"message" text NOT NULL,
	"data" json,
	"is_read" boolean DEFAULT false,
	"read_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "patients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"date_of_birth" timestamp,
	"gender" varchar(20),
	"phone_number" varchar(20),
	"address" text,
	"emergency_contact" varchar(256),
	"emergency_phone" varchar(20),
	"medical_history" json,
	"allergies" json,
	"current_medications" json,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "reported_symptoms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"symptom_id" uuid NOT NULL,
	"severity" integer NOT NULL,
	"duration" varchar(100),
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "symptom_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(256) NOT NULL,
	"description" text,
	"category" "symptom_category" NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "symptoms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(256) NOT NULL,
	"description" text,
	"category_id" uuid,
	"common_name" varchar(256),
	"severity_scale" integer DEFAULT 10,
	"is_common" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_id" varchar(256) NOT NULL,
	"email" varchar(256) NOT NULL,
	"name" varchar(256),
	"role" "user_role" NOT NULL,
	"is_active" boolean DEFAULT true,
	"onboarding_complete" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_clerk_id_unique" UNIQUE("clerk_id")
);
--> statement-breakpoint
CREATE TABLE "feature_engineering_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"original_symptoms" json NOT NULL,
	"processed_features" json NOT NULL,
	"feature_selection_method" varchar(100),
	"dimensionality_reduction" varchar(100),
	"scaling_method" varchar(100),
	"missing_data_handling" varchar(100),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ml_models" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(256) NOT NULL,
	"version" varchar(50) NOT NULL,
	"model_type" varchar(100) NOT NULL,
	"status" "model_status" DEFAULT 'training' NOT NULL,
	"accuracy" numeric(5, 4),
	"precision" numeric(5, 4),
	"recall" numeric(5, 4),
	"f1_score" numeric(5, 4),
	"training_data_size" integer,
	"training_date" timestamp,
	"deployment_date" timestamp,
	"is_active" boolean DEFAULT false,
	"model_path" varchar(500),
	"hyperparameters" json,
	"feature_importance" json,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "model_metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"model_id" uuid NOT NULL,
	"metric_date" timestamp DEFAULT now(),
	"total_predictions" integer DEFAULT 0,
	"correct_predictions" integer DEFAULT 0,
	"false_positives" integer DEFAULT 0,
	"false_negatives" integer DEFAULT 0,
	"average_confidence" numeric(5, 4),
	"doctor_agreement_rate" numeric(5, 4),
	"patient_satisfaction_score" numeric(3, 2),
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "prediction_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"model_id" uuid NOT NULL,
	"status" "prediction_status" DEFAULT 'pending' NOT NULL,
	"input_data" json NOT NULL,
	"output_data" json,
	"processing_time" integer,
	"error_message" text,
	"confidence_scores" json,
	"feature_vector" json,
	"created_at" timestamp DEFAULT now(),
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "training_data" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid,
	"symptoms" json NOT NULL,
	"patient_demographics" json,
	"confirmed_diagnosis" varchar(256),
	"doctor_validated" boolean DEFAULT false,
	"is_used_for_training" boolean DEFAULT false,
	"data_quality_score" numeric(3, 2),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "diagnosis_feedback" ADD CONSTRAINT "diagnosis_feedback_session_id_diagnosis_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."diagnosis_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diagnosis_feedback" ADD CONSTRAINT "diagnosis_feedback_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diagnosis_sessions" ADD CONSTRAINT "diagnosis_sessions_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diagnosis_sessions" ADD CONSTRAINT "diagnosis_sessions_doctor_id_doctors_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctor_reviews" ADD CONSTRAINT "doctor_reviews_session_id_diagnosis_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."diagnosis_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctor_reviews" ADD CONSTRAINT "doctor_reviews_doctor_id_doctors_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ml_predictions" ADD CONSTRAINT "ml_predictions_session_id_diagnosis_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."diagnosis_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ml_predictions" ADD CONSTRAINT "ml_predictions_disease_id_diseases_id_fk" FOREIGN KEY ("disease_id") REFERENCES "public"."diseases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patients" ADD CONSTRAINT "patients_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reported_symptoms" ADD CONSTRAINT "reported_symptoms_session_id_diagnosis_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."diagnosis_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reported_symptoms" ADD CONSTRAINT "reported_symptoms_symptom_id_symptoms_id_fk" FOREIGN KEY ("symptom_id") REFERENCES "public"."symptoms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "symptoms" ADD CONSTRAINT "symptoms_category_id_symptom_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."symptom_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_engineering_logs" ADD CONSTRAINT "feature_engineering_logs_session_id_diagnosis_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."diagnosis_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model_metrics" ADD CONSTRAINT "model_metrics_model_id_ml_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."ml_models"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prediction_logs" ADD CONSTRAINT "prediction_logs_session_id_diagnosis_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."diagnosis_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prediction_logs" ADD CONSTRAINT "prediction_logs_model_id_ml_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."ml_models"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_data" ADD CONSTRAINT "training_data_session_id_diagnosis_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."diagnosis_sessions"("id") ON DELETE no action ON UPDATE no action;
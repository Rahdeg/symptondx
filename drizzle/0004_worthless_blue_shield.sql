ALTER TYPE "public"."notification_type" ADD VALUE 'ai_processing_started';--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE 'rate_limit_exceeded';--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE 'usage_limit_exceeded';--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE 'ai_processing_failed';--> statement-breakpoint
CREATE TABLE "ai_usage_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"session_id" uuid,
	"tokens_used" integer NOT NULL,
	"cost" numeric(10, 4) NOT NULL,
	"model" varchar(100) NOT NULL,
	"endpoint" varchar(100) NOT NULL,
	"processing_time" integer,
	"success" boolean DEFAULT true NOT NULL,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ai_usage_logs" ADD CONSTRAINT "ai_usage_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_usage_logs" ADD CONSTRAINT "ai_usage_logs_session_id_diagnosis_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."diagnosis_sessions"("id") ON DELETE cascade ON UPDATE no action;
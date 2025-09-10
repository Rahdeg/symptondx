CREATE TABLE "admins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"organization_name" varchar(256) NOT NULL,
	"job_title" varchar(256) NOT NULL,
	"phone_number" varchar(20) NOT NULL,
	"department" varchar(256),
	"management_level" varchar(50) NOT NULL,
	"system_permissions" json,
	"preferred_notifications" json,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "admins" ADD CONSTRAINT "admins_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
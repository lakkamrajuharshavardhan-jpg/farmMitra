CREATE TYPE "public"."risk_level" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('user', 'assistant');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('done', 'skipped');--> statement-breakpoint
CREATE TABLE "advisories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"field_id" uuid NOT NULL,
	"irrigation_plan" text NOT NULL,
	"fertilizer_plan" jsonb NOT NULL,
	"risk_level" text NOT NULL,
	"risk_notes" text NOT NULL,
	"cost_of_inaction" text NOT NULL,
	"plan_drift_detected" boolean DEFAULT false NOT NULL,
	"drift_explanation" text,
	"next_check_in" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"field_id" uuid NOT NULL,
	"role" text NOT NULL,
	"message" text NOT NULL,
	"image_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fields" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"crop_type" text NOT NULL,
	"sowing_date" date NOT NULL,
	"soil_type" text NOT NULL,
	"location" text NOT NULL,
	"latitude" numeric NOT NULL,
	"longitude" numeric NOT NULL,
	"acreage" numeric NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "treatment_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"advisory_id" uuid NOT NULL,
	"action_taken" text NOT NULL,
	"status" text NOT NULL,
	"farmer_note" text,
	"done_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "advisories" ADD CONSTRAINT "advisories_field_id_fields_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."fields"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_field_id_fields_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."fields"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fields" ADD CONSTRAINT "fields_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "treatment_logs" ADD CONSTRAINT "treatment_logs_advisory_id_advisories_id_fk" FOREIGN KEY ("advisory_id") REFERENCES "public"."advisories"("id") ON DELETE cascade ON UPDATE no action;
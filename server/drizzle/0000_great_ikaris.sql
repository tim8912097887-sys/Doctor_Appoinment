CREATE TYPE "public"."user_role" AS ENUM('admin', 'user', 'doctor');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" varchar(50) NOT NULL,
	"last_name" varchar(50) NOT NULL,
	"email" varchar(60) NOT NULL,
	"password" text NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"verified_token" text DEFAULT '',
	"reset_token" text DEFAULT '',
	"reset_token_expired" date,
	"token_version" integer DEFAULT 0 NOT NULL,
	"role" "user_role" DEFAULT 'user' NOT NULL,
	CONSTRAINT "unique_email" UNIQUE("email")
);

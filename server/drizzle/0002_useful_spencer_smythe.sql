ALTER TABLE "users" ADD COLUMN "is_2faActive" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "two_factor_secret" text;
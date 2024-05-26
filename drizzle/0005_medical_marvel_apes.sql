ALTER TABLE "users" ADD COLUMN "service_cut_modifier" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "service_cut_percentage";
CREATE TABLE IF NOT EXISTS "crew_earnings" (
	"id" varchar PRIMARY KEY NOT NULL,
	"transaction_service_id" varchar NOT NULL,
	"crew_id" varchar NOT NULL,
	"computed_service_cut_percentage" integer,
	"amount" numeric(10, 2) NOT NULL,
	"crew_cut_percentage" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"created_by" varchar,
	"updated_by" varchar,
	"deleted_by" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "reset_password_tokens" (
	"id" varchar PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"is_valid" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"created_by" varchar,
	"updated_by" varchar,
	"deleted_by" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "services" (
	"id" varchar PRIMARY KEY NOT NULL,
	"service_name" varchar NOT NULL,
	"description" text,
	"service_cut_percentage" integer DEFAULT 0 NOT NULL,
	"price_matrix" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"created_by" varchar,
	"updated_by" varchar,
	"deleted_by" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sessions" (
	"id" varchar PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "transaction_services" (
	"id" varchar PRIMARY KEY NOT NULL,
	"transaction_id" varchar NOT NULL,
	"service_id" varchar NOT NULL,
	"price" real NOT NULL,
	"service_by" jsonb NOT NULL,
	"service_cut_percentage" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"created_by" varchar,
	"updated_by" varchar,
	"deleted_by" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "transactions" (
	"id" varchar PRIMARY KEY NOT NULL,
	"customer_name" varchar,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"total_price" numeric(10, 2) NOT NULL,
	"note" varchar,
	"plate_number" varchar(12) NOT NULL,
	"vehicle_size" varchar NOT NULL,
	"discount" numeric(10, 2) DEFAULT '0' NOT NULL,
	"tip" numeric(10, 2) DEFAULT '0' NOT NULL,
	"mode_of_payment" varchar(64) DEFAULT 'cash' NOT NULL,
	"completed_at" timestamp with time zone,
	"completed_by" varchar,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"created_by" varchar,
	"updated_by" varchar,
	"deleted_by" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"email" varchar NOT NULL,
	"role" varchar(64) NOT NULL,
	"service_cut_percentage" integer DEFAULT 0,
	"image" varchar,
	"is_first_time_login" boolean DEFAULT true NOT NULL,
	"hashed_password" varchar NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"created_by" varchar,
	"updated_by" varchar,
	"deleted_by" varchar,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "crew_earning_created_at_idx" ON "crew_earnings" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "crew_earning_transaction_service_id_idx" ON "crew_earnings" ("transaction_service_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "crew_earning_crew_id_idx" ON "crew_earnings" ("crew_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "transaction_service_created_at_idx" ON "transaction_services" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "transaction_service_transaction_id_idx" ON "transaction_services" ("transaction_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "transaction_service_service_id_idx" ON "transaction_services" ("service_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "transaction_created_at_idx" ON "transactions" ("created_at");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "crew_earnings" ADD CONSTRAINT "crew_earnings_transaction_service_id_transaction_services_id_fk" FOREIGN KEY ("transaction_service_id") REFERENCES "transaction_services"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "crew_earnings" ADD CONSTRAINT "crew_earnings_crew_id_users_id_fk" FOREIGN KEY ("crew_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reset_password_tokens" ADD CONSTRAINT "reset_password_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transaction_services" ADD CONSTRAINT "transaction_services_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transaction_services" ADD CONSTRAINT "transaction_services_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transactions" ADD CONSTRAINT "transactions_completed_by_users_id_fk" FOREIGN KEY ("completed_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

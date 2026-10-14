CREATE TABLE "journal_state" (
	"key" text PRIMARY KEY,
	"data" jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"token" text PRIMARY KEY,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

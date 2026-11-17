CREATE TABLE "weight_record" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"date" date NOT NULL,
	"weight" numeric(4, 1) NOT NULL,
	"body_fat_percentage" numeric(3, 1),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "weight_record_user_id_date_unique" UNIQUE("user_id","date")
);
--> statement-breakpoint
ALTER TABLE "weight_record" ADD CONSTRAINT "weight_record_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
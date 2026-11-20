CREATE TABLE "workout_menu" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "workout_menu_user_id_name_unique" UNIQUE("user_id","name")
);
--> statement-breakpoint
CREATE TABLE "workout_menu_exercise" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"menu_id" uuid NOT NULL,
	"exercise_id" uuid NOT NULL,
	"position" integer NOT NULL,
	CONSTRAINT "workout_menu_exercise_menu_id_exercise_id_unique" UNIQUE("menu_id","exercise_id")
);
--> statement-breakpoint
ALTER TABLE "workout_menu" ADD CONSTRAINT "workout_menu_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_menu_exercise" ADD CONSTRAINT "workout_menu_exercise_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_menu_exercise" ADD CONSTRAINT "workout_menu_exercise_menu_id_workout_menu_id_fk" FOREIGN KEY ("menu_id") REFERENCES "public"."workout_menu"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_menu_exercise" ADD CONSTRAINT "workout_menu_exercise_exercise_id_workout_exercise_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."workout_exercise"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "workout_exercise" ADD COLUMN "position" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "workout_exercise" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
-- これまでの種目は、ユーザーごとに登録した順を並び順にする
UPDATE "workout_exercise" AS e SET "position" = o."position" FROM (SELECT "id", (row_number() OVER (PARTITION BY "user_id" ORDER BY "created_at", "id") - 1)::integer AS "position" FROM "workout_exercise") AS o WHERE e."id" = o."id";

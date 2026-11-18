import {
  date,
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "@/shared/auth/schema";

/**
 * 筋トレの種目。ユーザーごとに登録する（例: ベンチプレス）。
 * 仕様は docs/features/workout.md。
 */
export const workoutExercise = pgTable(
  "workout_exercise",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  // 同じユーザーの中で同じ名前の種目は1つだけ
  (table) => [
    unique("workout_exercise_user_id_name_unique").on(table.userId, table.name),
  ],
);

/**
 * 筋トレの1セット（重量 × 回数）。
 * 同じ日・同じ種目の中では、作成日時の順（入力した順）に並べる。
 */
export const workoutSet = pgTable(
  "workout_set",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    exerciseId: uuid("exercise_id")
      .notNull()
      .references(() => workoutExercise.id, { onDelete: "cascade" }),
    // 時刻は持たない日付（YYYY-MM-DD の文字列で扱う）
    date: date("date", { mode: "string" }).notNull(),
    // 重量 kg。小数点以下2桁（例: 61.25）。自重の種目は空
    weight: numeric("weight", { precision: 5, scale: 2, mode: "number" }),
    // 回数
    reps: integer("reps").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    // ユーザーの記録を日付で絞り込む・並べるための索引
    index("workout_set_user_id_date_idx").on(table.userId, table.date),
    // 種目ごとの前回の記録を探すための索引
    index("workout_set_exercise_id_date_idx").on(table.exerciseId, table.date),
  ],
);

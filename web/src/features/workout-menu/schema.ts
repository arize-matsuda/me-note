import {
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { workoutExercise } from "@/features/workout/schema";
import { user } from "@/shared/auth/schema";

/**
 * 筋トレのメニュー（いつもやる種目のまとまり。例: 胸の日）。ユーザーごとに登録する。
 * 仕様は docs/features/workout-menu.md。
 */
export const workoutMenu = pgTable(
  "workout_menu",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  // 同じユーザーの中で同じ名前のメニューは1つだけ
  (table) => [
    unique("workout_menu_user_id_name_unique").on(table.userId, table.name),
  ],
);

/**
 * メニューに入れた種目と、その順番。
 * メニューを削除すると一緒に消える。筋トレの記録（workout_set）には影響しない。
 */
export const workoutMenuExercise = pgTable(
  "workout_menu_exercise",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    menuId: uuid("menu_id")
      .notNull()
      .references(() => workoutMenu.id, { onDelete: "cascade" }),
    exerciseId: uuid("exercise_id")
      .notNull()
      .references(() => workoutExercise.id, { onDelete: "cascade" }),
    // メニューの中の並び順（0 から）
    position: integer("position").notNull(),
  },
  // 1つのメニューに同じ種目は1回だけ
  (table) => [
    unique("workout_menu_exercise_menu_id_exercise_id_unique").on(
      table.menuId,
      table.exerciseId,
    ),
  ],
);

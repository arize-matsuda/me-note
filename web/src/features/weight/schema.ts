import {
  date,
  numeric,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "@/shared/auth/schema";

/**
 * 体重・体脂肪率の記録。1人のユーザーにつき、1日1件。
 * 仕様は docs/features/weight.md。
 */
export const weightRecord = pgTable(
  "weight_record",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    // 時刻は持たない日付（YYYY-MM-DD の文字列で扱う）
    date: date("date", { mode: "string" }).notNull(),
    // 体重 kg。小数点以下1桁（例: 65.3）
    weight: numeric("weight", {
      precision: 4,
      scale: 1,
      mode: "number",
    }).notNull(),
    // 体脂肪率 %。小数点以下1桁（例: 18.5）。測っていない日は空
    bodyFatPercentage: numeric("body_fat_percentage", {
      precision: 3,
      scale: 1,
      mode: "number",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  // 同じユーザーの同じ日付の記録は1件だけ。日付順の検索にも使われる
  (table) => [
    unique("weight_record_user_id_date_unique").on(table.userId, table.date),
  ],
);

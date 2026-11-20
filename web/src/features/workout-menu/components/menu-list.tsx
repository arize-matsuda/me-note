"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { ConfirmDeleteDialog } from "@/features/workout/components/confirm-delete-dialog";
import type { Exercise } from "@/features/workout/data";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { FieldError } from "@/shared/components/ui/field";
import { deleteMenu, updateMenu } from "../actions";
import type { WorkoutMenu } from "../group";
import { MenuEditor } from "./menu-editor";

type Props = {
  menus: WorkoutMenu[];
  /** 登録した種目（直すときの選択肢に使う） */
  exercises: Exercise[];
};

/** 登録したメニューの一覧。メニューごとに直す・削除できる */
export function MenuList({ menus, exercises }: Props) {
  return (
    <Card className="md:[--card-spacing:--spacing(6)]">
      <CardHeader>
        <CardTitle className="text-base font-bold md:text-[17px]">
          登録したメニュー
        </CardTitle>
      </CardHeader>
      <CardContent>
        {menus.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            まだメニューがありません。
          </p>
        ) : (
          <ul className="flex flex-col divide-y">
            {menus.map((menu) => (
              <MenuItem key={menu.id} menu={menu} exercises={exercises} />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function MenuItem({
  menu,
  exercises,
}: {
  menu: WorkoutMenu;
  exercises: Exercise[];
}) {
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (editing) {
    return (
      <li className="py-4 first:pt-0 last:pb-0">
        <MenuEditor
          exercises={exercises}
          action={updateMenu.bind(null, menu.id)}
          menu={menu}
          submitLabel="保存する"
          onSaved={() => setEditing(false)}
          onCancel={() => setEditing(false)}
        />
      </li>
    );
  }

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteMenu(menu.id);
      if (!result.ok) {
        setError(result.message ?? "削除できませんでした。");
      }
    });
  }

  return (
    <li className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0">
      <div className="flex items-center gap-1">
        <h3 className="min-w-0 flex-1 truncate font-bold">{menu.name}</h3>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-11"
          aria-label={`${menu.name}を直す`}
          onClick={() => setEditing(true)}
          disabled={pending}
        >
          <Pencil />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-11"
          aria-label={`${menu.name}を削除`}
          onClick={() => setConfirming(true)}
          disabled={pending}
        >
          <Trash2 />
        </Button>
      </div>
      <ol className="flex flex-col gap-0.5 text-sm text-muted-foreground">
        {menu.exercises.map((exercise, index) => (
          <li key={exercise.id} className="flex gap-2">
            <span className="w-5 shrink-0 tabular-nums">{index + 1}.</span>
            <span className="min-w-0 break-words">{exercise.name}</span>
          </li>
        ))}
      </ol>
      {error && <FieldError>{error}</FieldError>}
      <ConfirmDeleteDialog
        open={confirming}
        onOpenChange={setConfirming}
        title="メニューを削除しますか？"
        description={`「${menu.name}」を削除します。これまでの筋トレの記録は消えません。`}
        onConfirm={handleDelete}
      />
    </li>
  );
}

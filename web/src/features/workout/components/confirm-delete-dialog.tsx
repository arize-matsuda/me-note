"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 確認の見出し。省略すると「記録を削除しますか？」 */
  title?: string;
  /** 何を削除するかの説明（例: 「11/18（水）のベンチプレスの記録（3セット）を削除します。」） */
  description: string;
  onConfirm: () => void;
};

/** 削除の前に出す確認 */
export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  title = "記録を削除しますか？",
  description,
  onConfirm,
}: Props) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description}元に戻せません。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>キャンセル</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm}>
            削除する
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

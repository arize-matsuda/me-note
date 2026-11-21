"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

export type AppSelectOption = { value: string; label: string };

type Props = {
  /** ボタンの id。FieldLabel の htmlFor と合わせて、プルダウンの名前にする */
  id: string;
  /** フォームで送るときの名前。省略するとフォームの値にしない */
  name?: string;
  options: AppSelectOption[];
  /** 選んでいる項目の value。何も選んでいないときは null */
  value: string | null;
  onValueChange: (value: string) => void;
  /** 何も選んでいないときに薄く出す案内 */
  placeholder?: string;
  disabled?: boolean;
  /** 入力のエラーがあるとき true（赤い枠にする） */
  invalid?: boolean;
};

/**
 * アプリのプルダウン。shadcn/ui の Select（Base UI）を、案C の見た目
 * （ほかの入力欄と同じ枠、44px 以上の行、白いカードの一覧）にそろえて使う。
 * 仕様は docs/features/select.md。
 */
export function AppSelect({
  id,
  name,
  options,
  value,
  onValueChange,
  placeholder,
  disabled,
  invalid,
}: Props) {
  return (
    <Select
      name={name}
      items={options}
      value={value}
      onValueChange={(next) => {
        if (typeof next === "string") {
          onValueChange(next);
        }
      }}
      disabled={disabled}
    >
      <SelectTrigger
        id={id}
        aria-invalid={invalid || undefined}
        className="w-full min-w-0 px-3 text-base data-[size=default]:h-11 md:text-sm"
      >
        <SelectValue placeholder={placeholder} className="min-w-0" />
      </SelectTrigger>
      <SelectContent
        alignItemWithTrigger={false}
        className="rounded-xl p-1 shadow-lg ring-border"
      >
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className="min-h-11 rounded-lg pr-9 pl-3 text-base md:text-sm [&>div:first-child]:min-w-0 [&>div:first-child]:shrink [&>div:first-child]:whitespace-normal [&>div:first-child]:break-words [&_svg]:text-primary"
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

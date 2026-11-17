"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { authClient } from "@/shared/auth/client";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";

const MIN_PASSWORD_LENGTH = 8;

// shadcn/ui のテンプレート signup-01 をもとにしている
export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password"));
    setError(null);

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`パスワードは${MIN_PASSWORD_LENGTH}文字以上にしてください。`);
      return;
    }
    if (password !== String(formData.get("confirm-password"))) {
      setError("確認用のパスワードが一致しません。");
      return;
    }

    setPending(true);
    const { error } = await authClient.signUp.email({
      name: String(formData.get("name")),
      email: String(formData.get("email")),
      password,
    });

    if (error) {
      setError(
        error.code === "USER_ALREADY_EXISTS" ||
          error.code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL"
          ? "このメールアドレスはすでに登録されています。"
          : "登録できませんでした。入力内容を確認してください。",
      );
      setPending(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>新規登録</CardTitle>
        <CardDescription>アカウントを作成します</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">名前</FieldLabel>
              <Input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="email">メールアドレス</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="m@example.com"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="password">パスワード</FieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
              />
              <FieldDescription>
                {MIN_PASSWORD_LENGTH}文字以上で入力してください。
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="confirm-password">
                パスワード（確認）
              </FieldLabel>
              <Input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
              />
            </Field>
            {error && <FieldError>{error}</FieldError>}
            <Field>
              <Button type="submit" disabled={pending}>
                {pending ? "登録中…" : "登録する"}
              </Button>
              <FieldDescription className="px-6 text-center">
                アカウントをお持ちの方は <Link href="/login">ログイン</Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}

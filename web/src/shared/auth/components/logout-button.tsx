"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/shared/auth/client";
import { Button } from "@/shared/components/ui/button";

export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);
    await authClient.signOut();
    router.push("/login");
    router.refresh();
    // Next.js は前に開いていた画面の状態を残すため、ここで戻しておかないと、
    // もう一度ログインしたときに「ログアウト中…」のまま押せなくなる
    setPending(false);
  }

  return (
    <Button variant="outline" onClick={handleClick} disabled={pending}>
      {pending ? "ログアウト中…" : "ログアウト"}
    </Button>
  );
}

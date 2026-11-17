import type { Metadata } from "next";
import { SignupForm } from "@/shared/auth/components/signup-form";

export const metadata: Metadata = {
  title: "新規登録 | me-note",
};

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <SignupForm />
      </div>
    </div>
  );
}

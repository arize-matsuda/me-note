import type { Metadata } from "next";
import { SignupForm } from "@/shared/auth/components/signup-form";
import { BrandMark } from "@/shared/components/brand-mark";

export const metadata: Metadata = {
  title: "新規登録 | me-note",
};

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <BrandMark className="justify-center text-2xl" />
        <SignupForm />
      </div>
    </div>
  );
}

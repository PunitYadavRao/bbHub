import { Suspense } from "react";
import { AuthButtons, GuestButtons } from "@/components/auth-buttons";
import { BrandLockup } from "@/components/brand-lockup";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center px-4 text-center sm:px-6">
      <header className="flex w-full flex-col items-center justify-center gap-3 py-5">
        <BrandLockup />
        <p className="max-w-xs text-balance text-sm font-semibold italic tracking-tight sm:max-w-none sm:text-base">
          We’ve got your back ,{" "}
          <span className="text-brand">you’ve got the bench.</span>
        </p>
        <div className="mt-3">
          <Suspense fallback={<GuestButtons />}>
            <AuthButtons />
          </Suspense>
        </div>
      </header>
    </main>
  );
}

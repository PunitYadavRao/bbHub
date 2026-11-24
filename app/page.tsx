import { Suspense } from "react";
import { LoginButton, NavAuthButton } from "@/components/auth-buttons";
import { BrandLockup } from "@/components/brand-lockup";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center px-4 text-center sm:px-6">
      <nav className="flex w-full items-center justify-end pt-3">
        <Suspense fallback={<LoginButton />}>
          <NavAuthButton />
        </Suspense>
      </nav>
      <header className="flex w-full flex-col items-center justify-center gap-3 pb-5 pt-2">
        <BrandLockup />
        <p className="max-w-xs text-balance text-sm font-semibold italic tracking-tight sm:max-w-none sm:text-base">
          We’ve got your back ,{" "}
          <span className="text-brand">you’ve got the bench.</span>
        </p>
      </header>
    </main>
  );
}

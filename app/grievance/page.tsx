import type { Metadata } from "next";
import { BrandLockup } from "@/components/brand-lockup";
import { TransitionLink } from "@/components/page-transition";

export const metadata: Metadata = {
  title: "Grievance Officer | BBHub",
  description: "Who to contact about content or account issues on BBHub.",
};

export default function GrievancePage() {
  return (
    <main className="flex flex-1 flex-col items-center px-4 py-5 sm:px-6">
      <BrandLockup size="sm" />
      <div className="flex w-full flex-1 items-center justify-center py-12">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Grievance Officer</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            BBHub’s grievance officer and their contact details will be listed here soon.
          </p>
          <TransitionLink
            href="/"
            className="mt-6 inline-flex rounded-full border border-border px-4 py-2 text-sm font-semibold transition hover:border-brand hover:bg-brand"
          >
            Back to BBHub
          </TransitionLink>
        </div>
      </div>
      <p className="max-w-sm text-balance text-center text-xs text-muted">
        Student-run. Not affiliated with any university administration.
      </p>
    </main>
  );
}

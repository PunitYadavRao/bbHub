import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { BrandLockup } from "@/components/brand-lockup";
import { googleEnabled } from "@/lib/auth";
import { CAMPUS_EMAIL_ERROR } from "@/lib/domain-guard";
import { getCurrentUser } from "@/lib/session";
import { JoinFlow } from "./join-flow";

export const metadata: Metadata = {
  title: "Log in to BBHub",
  description: "Sign in with your college Google account.",
};

export default function JoinPage({ searchParams }: PageProps<"/join">) {
  return (
    <main className="flex flex-1 flex-col items-center px-4 py-5 sm:px-6">
      <BrandLockup size="sm" />
      <div className="flex w-full flex-1 items-center justify-center py-8">
        <Suspense fallback={<CardSkeleton />}>
          <JoinGate searchParams={searchParams} />
        </Suspense>
      </div>
      <p className="max-w-sm text-balance text-center text-xs text-muted">
        Student-run. Not affiliated with any university administration.
      </p>
    </main>
  );
}

async function JoinGate({ searchParams }: Pick<PageProps<"/join">, "searchParams">) {
  const [me, params] = await Promise.all([getCurrentUser(), searchParams]);

  if (me?.onboardingCompleted || me?.isBanned) redirect("/home");

  return (
    <JoinFlow
      key={me?.id ?? "guest"}
      signedIn={Boolean(me)}
      googleEnabled={googleEnabled}
      initialError={describeError(params.error)}
    />
  );
}

// Errors Better Auth appends to the URL after a failed Google sign-in.
function describeError(code: string | string[] | undefined): string | null {
  if (typeof code !== "string") return null;
  if (code === "college_email_required") return CAMPUS_EMAIL_ERROR;
  return "Google sign-in didn't work. Use your college Google account and try again.";
}

function CardSkeleton() {
  return <div className="h-11 w-full max-w-xs animate-pulse rounded-xl bg-surface" />;
}

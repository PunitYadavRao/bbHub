import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { BrandLockup } from "@/components/brand-lockup";
import { getCurrentUser } from "@/lib/session";
import { SignOutButton } from "./sign-out-button";

export const metadata: Metadata = { title: "BBHub" };

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col">
      <Suspense fallback={<HomeSkeleton />}>
        <HomeContent />
      </Suspense>
    </main>
  );
}

async function HomeContent() {
  const me = await getCurrentUser();
  if (!me) redirect("/join");

  if (me.isBanned) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 text-center">
        <p className="max-w-sm text-sm text-muted">
          This account has been suspended. If you think this is a mistake, contact the BBHub team.
        </p>
      </div>
    );
  }

  if (!me.onboardingCompleted) redirect("/join");

  return (
    <>
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-border bg-background/90 px-4 backdrop-blur sm:px-6">
        <BrandLockup size="sm" />
        <div className="flex items-center gap-2">
          <span className="hidden rounded-full border border-border bg-surface px-3 py-1 text-xs text-zinc-300 sm:inline">
            {me.handle} · {me.hostelId}
          </span>
          <SignOutButton />
        </div>
      </header>

      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
        <div className="rounded-2xl border border-border bg-surface p-6">
          <h1 className="text-xl font-bold">
            Welcome, <span className="text-brand">{me.handle}</span>
          </h1>
          <p className="mt-1 text-sm text-muted">
            Verified student · {me.hostelId} · Batch {me.batchYear}. Your email stays private and is
            never linked to anything you post.
          </p>
          <p className="mt-4 text-sm text-muted">
            The campus feed is coming next.{" "}
            <Link href="/" className="text-foreground underline">
              Back to the home page
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}

function HomeSkeleton() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <div className="h-32 animate-pulse rounded-2xl bg-surface" />
    </div>
  );
}

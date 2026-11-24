import type { Metadata } from "next";
import Image from "next/image";
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

  if (!me.onboardingCompleted || !me.username) redirect("/join");

  return (
    <>
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-border bg-background/90 px-4 backdrop-blur sm:px-6">
        <BrandLockup size="sm" />
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-full border border-border bg-surface py-1 pl-1.5 pr-3">
            {me.avatarUrl ? (
              <Image
                src={me.avatarUrl}
                alt={me.avatarLabel ?? "Avatar"}
                width={24}
                height={24}
                unoptimized
                className="size-6 rounded-full"
              />
            ) : (
              <div className="flex size-6 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold">
                {me.username.slice(0, 2).toUpperCase()}
              </div>
            )}
            <span className="text-xs font-medium text-zinc-200">{me.username}</span>
          </div>
          <SignOutButton />
        </div>
      </header>

      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        <div className="rounded-2xl border border-border bg-surface p-6">
          <h1 className="text-xl font-bold">
            Welcome to BBHub, <span className="text-brand">{me.username}</span>
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            You&apos;re verified through your college Google account. Your email stays private and is
            never linked to anything you post.
          </p>
          <p className="mt-4 text-sm text-muted">The campus feed is coming next.</p>
        </div>
      </div>
    </>
  );
}

function HomeSkeleton() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <div className="h-32 animate-pulse rounded-2xl bg-surface" />
    </div>
  );
}

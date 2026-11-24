import Link from "next/link";
import { headers } from "next/headers";
import { getSessionCookie } from "better-auth/cookies";
import { getCurrentUser } from "@/lib/session";

const primary =
  "rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-hover";
const secondary =
  "rounded-full border border-border px-6 py-2.5 text-sm font-semibold text-foreground transition hover:border-white/40";

/** Shown to visitors without a session, and while the session check streams in. */
export function GuestButtons() {
  return (
    <div className="flex items-center justify-center gap-3">
      <Link href="/join?mode=signup" className={primary}>
        Sign up
      </Link>
      <Link href="/join?mode=login" className={secondary}>
        Log in
      </Link>
    </div>
  );
}

/** Swaps the guest buttons for "Open BBHub" when the visitor is signed in. */
export async function AuthButtons() {
  const requestHeaders = await headers();
  // No session cookie: skip the database entirely.
  if (!getSessionCookie(requestHeaders)) return <GuestButtons />;

  const me = await getCurrentUser().catch(() => null);
  if (!me || me.isBanned) return <GuestButtons />;

  return (
    <div className="flex items-center justify-center">
      <Link href={me.onboardingCompleted ? "/home" : "/join"} className={primary}>
        {me.onboardingCompleted ? "Open BBHub" : "Finish signing up"}
      </Link>
    </div>
  );
}

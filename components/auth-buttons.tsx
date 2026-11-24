import Link from "next/link";
import { headers } from "next/headers";
import { getSessionCookie } from "better-auth/cookies";
import { getCurrentUser } from "@/lib/session";

const navButton =
  "rounded-full bg-brand px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-brand-hover";

/** Shown to visitors without a session, and while the session check streams in. */
export function LoginButton() {
  return (
    <Link href="/join" className={navButton}>
      Log in
    </Link>
  );
}

/** The navbar's corner button: "Log in", or a way back in for signed-in students. */
export async function NavAuthButton() {
  const requestHeaders = await headers();
  // No session cookie: skip the database entirely.
  if (!getSessionCookie(requestHeaders)) return <LoginButton />;

  const me = await getCurrentUser().catch(() => null);
  if (!me || me.isBanned) return <LoginButton />;

  return (
    <Link href={me.onboardingCompleted ? "/home" : "/join"} className={navButton}>
      {me.onboardingCompleted ? "Open BBHub" : "Finish signing up"}
    </Link>
  );
}

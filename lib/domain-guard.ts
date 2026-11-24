import { getDb } from "@/db";
import { colleges } from "@/db/schema";

export const CAMPUS_EMAIL_ERROR =
  "Use your college email (@rishihood.edu.in or a subdomain like @nst.rishihood.edu.in).";

/** Returns the lowercase domain of a well-formed email, or null. */
export function emailDomain(email: string): string | null {
  const parts = email.trim().toLowerCase().split("@");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  return parts[1];
}

/** True when `domain` equals `allowed` or is a subdomain of it. */
export function domainMatches(domain: string, allowed: string): boolean {
  const root = allowed.trim().toLowerCase().replace(/^\.+/, "");
  return domain === root || domain.endsWith(`.${root}`);
}

/** Finds the college whose allowed domains cover this email, or null. */
export async function matchCollegeByEmail(email: string) {
  const domain = emailDomain(email);
  if (!domain) return null;

  const rows = await getDb().select().from(colleges);
  return (
    rows.find((college) =>
      college.allowedDomains.some((allowed) => domainMatches(domain, allowed)),
    ) ?? null
  );
}

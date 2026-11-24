import { NextResponse } from "next/server";
import { inArray } from "drizzle-orm";
import { getDb } from "@/db";
import { user } from "@/db/schema";
import { normalizeHandle } from "@/lib/handle-rules";
import { generateCandidateHandles } from "@/lib/handles";
import { getCurrentUser } from "@/lib/session";

// Returns 3 generated handles that aren't taken yet.
export async function GET() {
  const me = await getCurrentUser();
  if (!me) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const candidates = generateCandidateHandles(9);
  const taken = await getDb()
    .select({ username: user.username })
    .from(user)
    .where(inArray(user.username, candidates.map(normalizeHandle)));

  const takenSet = new Set(taken.map((row) => row.username));
  const handles = candidates
    .filter((handle) => !takenSet.has(normalizeHandle(handle)))
    .slice(0, 3);

  return NextResponse.json({ handles });
}

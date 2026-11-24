import { NextResponse } from "next/server";
import { completeOnboarding } from "@/lib/onboarding";
import { getCurrentUser } from "@/lib/session";

// Final onboarding step. Done on the server so the browser can't mark itself
// as onboarded or change fields it shouldn't.
export async function POST(request: Request) {
  const me = await getCurrentUser();
  if (!me) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (me.isBanned) {
    return NextResponse.json({ error: "This account is suspended." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const result = await completeOnboarding(me.id, body);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ ok: true });
}

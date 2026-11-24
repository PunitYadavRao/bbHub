import { NextResponse, type NextRequest } from "next/server";
import { isUsernameAvailable } from "@/lib/onboarding";
import { getCurrentUser } from "@/lib/session";

// Live availability check while typing a custom username. Signed-in students only.
export async function GET(request: NextRequest) {
  const me = await getCurrentUser();
  if (!me) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const username = request.nextUrl.searchParams.get("username") ?? "";
  return NextResponse.json(await isUsernameAvailable(username, me.id));
}

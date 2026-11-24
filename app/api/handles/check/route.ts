import { NextResponse, type NextRequest } from "next/server";
import { isHandleAvailable } from "@/lib/onboarding";
import { getCurrentUser } from "@/lib/session";

// Live availability check while typing a custom handle. Signed-in users only.
export async function GET(request: NextRequest) {
  const me = await getCurrentUser();
  if (!me) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const handle = request.nextUrl.searchParams.get("handle") ?? "";
  return NextResponse.json(await isHandleAvailable(handle, me.id));
}

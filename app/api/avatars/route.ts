import { NextResponse } from "next/server";
import { asc } from "drizzle-orm";
import { getDb } from "@/db";
import { presetAvatars } from "@/db/schema";
import { getCurrentUser } from "@/lib/session";

// Preset profile pictures, plus the student's current pick.
export async function GET() {
  const me = await getCurrentUser();
  if (!me) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const avatars = await getDb()
    .select({
      id: presetAvatars.id,
      label: presetAvatars.label,
      imageUrl: presetAvatars.imageUrl,
      category: presetAvatars.category,
    })
    .from(presetAvatars)
    .orderBy(asc(presetAvatars.sortOrder));

  return NextResponse.json({ currentAvatarId: me.avatarId, avatars });
}

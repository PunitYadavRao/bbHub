import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { user } from "@/db/schema";
import { BATCH_YEARS, HOSTELS } from "./campus";
import { normalizeHandle, validateHandleFormat } from "./handle-rules";

export type Availability = { available: true } | { available: false; reason: string };

export async function isHandleAvailable(raw: string, myUserId: string): Promise<Availability> {
  const format = validateHandleFormat(raw);
  if (!format.valid) return { available: false, reason: format.reason };

  const [existing] = await getDb()
    .select({ id: user.id })
    .from(user)
    .where(eq(user.username, normalizeHandle(raw)))
    .limit(1);

  if (existing && existing.id !== myUserId) {
    return { available: false, reason: "Already taken. Try another one." };
  }
  return { available: true };
}

export const onboardingSchema = z.object({
  handle: z.string().trim(),
  hostelId: z.enum(HOSTELS),
  batchYear: z.coerce
    .number()
    .int()
    .refine((year) => (BATCH_YEARS as readonly number[]).includes(year), "Pick a batch."),
});

export type OnboardingResult =
  | { ok: true }
  | { ok: false; status: number; error: string };

/** Saves the handle, hostel and batch once. The handle can never change afterwards. */
export async function completeOnboarding(
  userId: string,
  input: unknown,
): Promise<OnboardingResult> {
  const parsed = onboardingSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, status: 400, error: "Pick a handle, hostel and batch." };
  }
  const { handle, hostelId, batchYear } = parsed.data;

  const availability = await isHandleAvailable(handle, userId);
  if (!availability.available) {
    return { ok: false, status: 409, error: availability.reason };
  }

  try {
    const updated = await getDb()
      .update(user)
      .set({
        username: normalizeHandle(handle),
        displayUsername: handle,
        hostelId,
        batchYear,
        onboardingCompleted: true,
        updatedAt: new Date(),
      })
      // Only users who haven't picked a handle yet: handles are permanent.
      .where(and(eq(user.id, userId), isNull(user.username)))
      .returning({ id: user.id });

    if (updated.length === 0) {
      return { ok: false, status: 409, error: "Your handle is already set." };
    }
    return { ok: true };
  } catch (error) {
    // Unique violation: someone took the handle between the check and the save.
    if (isUniqueViolation(error)) {
      return { ok: false, status: 409, error: "That handle was just taken. Pick another." };
    }
    throw error;
  }
}

function isUniqueViolation(error: unknown): boolean {
  for (let e: unknown = error; e && typeof e === "object"; e = (e as { cause?: unknown }).cause) {
    if ((e as { code?: string }).code === "23505") return true;
  }
  return false;
}

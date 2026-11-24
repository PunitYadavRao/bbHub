"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <button
      type="button"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        await authClient.signOut();
        router.replace("/");
      }}
      className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted transition hover:text-foreground disabled:opacity-50"
    >
      Sign out
    </button>
  );
}

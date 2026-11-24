import { Suspense } from "react";
import { LoginButton, NavAuthButton } from "@/components/auth-buttons";
import { LandingShell } from "@/components/landing/landing-shell";
import { Scenes } from "@/components/landing/scenes";

export default function Home() {
  return (
    <LandingShell
      authSlot={
        <Suspense fallback={<LoginButton />}>
          <NavAuthButton />
        </Suspense>
      }
    >
      <Scenes />
    </LandingShell>
  );
}

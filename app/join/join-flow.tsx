"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, RefreshCw, XCircle } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { HANDLE_MAX, validateHandleFormat } from "@/lib/handle-rules";

type Props = {
  mode: "signup" | "login";
  signedIn: boolean;
  googleEnabled: boolean;
  initialError: string | null;
};

const primaryButton =
  "w-full rounded-xl bg-brand py-2.5 text-sm font-semibold text-white transition hover:bg-brand-hover disabled:opacity-50";

export function JoinFlow({ mode, signedIn, googleEnabled, initialError }: Props) {
  const step = signedIn ? 2 : 1;

  return (
    <div className="w-full max-w-lg rounded-2xl border border-border bg-surface p-6 sm:p-7">
      <div className="mb-5 flex justify-center">
        <span className="rounded-full border border-brand/30 bg-brand/10 px-3 py-1 font-pixel text-xs tracking-wider text-brand">
          STEP {step} OF 2
        </span>
      </div>
      {step === 1 ? (
        <GoogleStep mode={mode} googleEnabled={googleEnabled} initialError={initialError} />
      ) : (
        <ProfileStep />
      )}
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="mb-4 rounded-xl border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-xs text-danger"
    >
      {message}
    </div>
  );
}

function GoogleStep({
  mode,
  googleEnabled,
  initialError,
}: Omit<Props, "signedIn">) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError);

  async function handleGoogle() {
    setError(null);
    setLoading(true);
    const { error: googleError } = await authClient.signIn.social({
      provider: "google",
      callbackURL: "/join",
      errorCallbackURL: "/join",
    });
    if (googleError) {
      setLoading(false);
      setError(googleError.message ?? "Google sign-in didn't start. Try again.");
    }
  }

  return (
    <div>
      {error && <ErrorBox message={error} />}

      <h1 className="text-center text-2xl font-bold">
        {mode === "login" ? "Welcome back" : "Join your campus"}
      </h1>
      <p className="mt-1.5 text-center text-xs text-muted">
        Only @rishihood.edu.in and @nst.rishihood.edu.in Google accounts are accepted.
      </p>

      <button
        type="button"
        onClick={handleGoogle}
        disabled={loading || !googleEnabled}
        className="mt-6 flex w-full items-center justify-center gap-2.5 rounded-xl bg-white py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:opacity-50"
      >
        {loading ? <Loader2 className="size-4 animate-spin" /> : <GoogleLogo />}
        Continue with Google
      </button>

      {!googleEnabled && (
        <p className="mt-3 text-center text-xs text-muted">
          Google sign-in isn&apos;t switched on yet. Please try again soon.
        </p>
      )}

      <p className="mt-5 text-center text-xs text-muted">
        Your college email only proves you&apos;re a student. It&apos;s never shown or linked to
        your posts.
      </p>

      <p className="mt-4 text-center text-xs text-muted">
        {mode === "login" ? "New here? " : "Already have an account? "}
        <Link
          href={mode === "login" ? "/join?mode=signup" : "/join?mode=login"}
          className="font-medium text-foreground underline"
        >
          {mode === "login" ? "Sign up" : "Log in"}
        </Link>
      </p>
    </div>
  );
}

function GoogleLogo() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.67-.22-2.45H12v4.63h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.87c2.26-2.09 3.57-5.16 3.57-8.8Z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.87-3c-1.07.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.1A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.27 14.28a7.2 7.2 0 0 1 0-4.56v-3.1H1.27a12 12 0 0 0 0 10.76l4-3.1Z" />
      <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.61 4.59 1.8l3.43-3.43A11.97 11.97 0 0 0 12 0 12 12 0 0 0 1.27 6.62l4 3.1C6.22 6.88 8.87 4.77 12 4.77Z" />
    </svg>
  );
}

type Avatar = { id: string; label: string; imageUrl: string };
type RemoteCheck = { username: string; available: boolean; reason?: string };

function ProfileStep() {
  const router = useRouter();
  const [option, setOption] = useState<"suggested" | "custom">("suggested");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [rerollsLeft, setRerollsLeft] = useState(3);
  const [selected, setSelected] = useState("");
  const [custom, setCustom] = useState("");
  const [remote, setRemote] = useState<RemoteCheck | null>(null);
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [avatarId, setAvatarId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadSuggestions() {
    const res = await fetch("/api/username/suggest");
    if (!res.ok) {
      setError("Couldn't load username ideas. Type your own instead.");
      return;
    }
    const data: { handles: string[] } = await res.json();
    setSuggestions(data.handles);
    setSelected(data.handles[0] ?? "");
  }

  // Load username ideas and preset avatars once.
  useEffect(() => {
    let cancelled = false;
    Promise.all([fetch("/api/username/suggest"), fetch("/api/avatars")])
      .then(async ([suggestRes, avatarRes]) => {
        if (!suggestRes.ok || !avatarRes.ok) throw new Error("load failed");
        const suggestData: { handles: string[] } = await suggestRes.json();
        const avatarData: { avatars: Avatar[]; currentAvatarId: string | null } =
          await avatarRes.json();
        if (cancelled) return;
        setSuggestions(suggestData.handles);
        setSelected(suggestData.handles[0] ?? "");
        setAvatars(avatarData.avatars);
        setAvatarId(avatarData.currentAvatarId ?? avatarData.avatars[0]?.id ?? null);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load everything. Refresh the page to try again.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Format problems show instantly; availability is checked against the database after a pause.
  const trimmed = custom.trim();
  const localCheck = validateHandleFormat(trimmed);
  const remoteForInput = remote?.username === trimmed ? remote : null;

  useEffect(() => {
    if (option !== "custom" || !localCheck.valid) return;
    const timer = setTimeout(async () => {
      const res = await fetch(`/api/username/check?username=${encodeURIComponent(trimmed)}`);
      const data = res.ok
        ? await res.json()
        : { available: false, reason: "Couldn't check right now." };
      setRemote({ username: trimmed, ...data });
    }, 300);
    return () => clearTimeout(timer);
  }, [option, trimmed, localCheck.valid]);

  const status: "idle" | "invalid" | "checking" | "available" | "taken" =
    trimmed.length === 0
      ? "idle"
      : !localCheck.valid
        ? "invalid"
        : !remoteForInput
          ? "checking"
          : remoteForInput.available
            ? "available"
            : "taken";

  const chosen = option === "suggested" ? selected : trimmed;
  const canSubmit = !loading && Boolean(chosen) && (option === "suggested" || status === "available");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setLoading(true);
    const res = await fetch("/api/onboarding/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: chosen, avatarId }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setLoading(false);
      setError(data.error ?? "Couldn't save. Try again.");
      if (res.status === 409 && option === "suggested") loadSuggestions();
      return;
    }
    router.replace("/home");
  }

  async function handleSignOut() {
    await authClient.signOut();
    router.refresh();
  }

  const tabClass = (active: boolean) =>
    `rounded-lg py-1.5 font-medium transition ${
      active ? "bg-white/10 text-foreground" : "text-muted hover:text-foreground"
    }`;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <ErrorBox message={error} />}

      <div>
        <h1 className="text-xl font-bold">1. Pick your anonymous username</h1>
        <p className="mt-0.5 text-xs text-muted">
          Never linked to your real name or email. You can&apos;t change it later.
        </p>

        <div className="mb-3 mt-3 grid grid-cols-2 rounded-xl border border-border bg-surface-2 p-1 text-xs">
          <button type="button" onClick={() => setOption("suggested")} className={tabClass(option === "suggested")}>
            Quick pick
          </button>
          <button type="button" onClick={() => setOption("custom")} className={tabClass(option === "custom")}>
            Custom username
          </button>
        </div>

        {option === "suggested" ? (
          <div className="space-y-2">
            {suggestions.length === 0 && !error && (
              <div className="flex items-center justify-center gap-2 py-6 text-xs text-muted">
                <Loader2 className="size-4 animate-spin" /> Finding free usernames…
              </div>
            )}
            {suggestions.map((handle) => {
              const active = selected === handle;
              return (
                <button
                  type="button"
                  key={handle}
                  onClick={() => setSelected(handle)}
                  aria-pressed={active}
                  className={`flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-sm transition ${
                    active
                      ? "border-brand bg-brand/10 text-foreground"
                      : "border-border bg-surface-2 text-zinc-300 hover:border-white/25"
                  }`}
                >
                  <span>{handle}</span>
                  <span className="inline-flex items-center gap-1 text-xs text-success">
                    <CheckCircle2 className="size-3.5" /> Available
                  </span>
                </button>
              );
            })}
            <button
              type="button"
              disabled={rerollsLeft <= 0}
              onClick={() => {
                setRerollsLeft((n) => n - 1);
                loadSuggestions();
              }}
              className="inline-flex items-center gap-1.5 pt-1 text-xs text-muted hover:text-foreground disabled:opacity-40"
            >
              <RefreshCw className="size-3.5" /> New ideas ({rerollsLeft} left)
            </button>
          </div>
        ) : (
          <div>
            <div className="relative">
              <input
                type="text"
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                placeholder="Type a username (4–24 characters)"
                maxLength={HANDLE_MAX}
                autoComplete="off"
                aria-label="Custom username"
                className="w-full rounded-xl border border-border bg-surface-2 py-2.5 pl-3.5 pr-10 text-sm text-foreground placeholder:text-muted focus:border-brand focus:outline-none"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {status === "checking" && <Loader2 className="size-4 animate-spin text-muted" />}
                {status === "available" && <CheckCircle2 className="size-4 text-success" />}
                {(status === "invalid" || status === "taken") && <XCircle className="size-4 text-danger" />}
              </div>
            </div>
            <div className="mt-1.5 min-h-[18px] text-xs" aria-live="polite">
              {status === "available" && <span className="text-success">✓ Username is available</span>}
              {status === "invalid" && !localCheck.valid && (
                <span className="text-danger">✗ {localCheck.reason}</span>
              )}
              {status === "taken" && <span className="text-danger">✗ {remoteForInput?.reason}</span>}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-border pt-4">
        <h2 className="text-base font-bold">2. Choose a profile picture</h2>
        <p className="mb-3 text-xs text-muted">Optional. Pick any preset avatar.</p>
        <div className="grid grid-cols-5 gap-2.5">
          {avatars.map((avatar) => {
            const active = avatarId === avatar.id;
            return (
              <button
                type="button"
                key={avatar.id}
                onClick={() => setAvatarId(active ? null : avatar.id)}
                aria-pressed={active}
                aria-label={avatar.label}
                className={`flex flex-col items-center rounded-xl border p-1.5 transition ${
                  active ? "border-brand bg-brand/10" : "border-border bg-surface-2 hover:border-white/25"
                }`}
              >
                <Image
                  src={avatar.imageUrl}
                  alt=""
                  width={48}
                  height={48}
                  unoptimized
                  className="size-12 rounded-lg"
                />
                <span className="mt-1 w-full truncate text-center text-[10px] text-zinc-300">
                  {avatar.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <button type="submit" disabled={!canSubmit} className={primaryButton}>
        {loading ? "Saving…" : "Save & enter BBHub"}
      </button>

      <button
        type="button"
        onClick={handleSignOut}
        className="block w-full text-center text-xs text-muted hover:text-foreground"
      >
        Not you? Sign out
      </button>
    </form>
  );
}

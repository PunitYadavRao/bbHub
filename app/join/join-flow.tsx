"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, RefreshCw, ShieldCheck, XCircle } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { BATCH_YEARS, HOSTELS } from "@/lib/campus";
import { validateHandleFormat } from "@/lib/handle-rules";

type Step = 1 | 2 | 3;

type Props = {
  signedIn: boolean;
  googleEnabled: boolean;
  initialError: string | null;
};

const inputClass =
  "w-full rounded-xl border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-brand focus:outline-none";
const primaryButton =
  "w-full rounded-xl bg-brand py-2.5 text-sm font-semibold text-white transition hover:bg-brand-hover disabled:opacity-50";

export function JoinFlow({ signedIn, googleEnabled, initialError }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(signedIn ? 3 : 1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
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

  async function handleSendOtp(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const { error: sendError } = await authClient.emailOtp.sendVerificationOtp({
      email: email.trim().toLowerCase(),
      type: "sign-in",
    });
    setLoading(false);
    if (sendError) {
      setError(sendError.message ?? "Couldn't send the code. Try again.");
      return;
    }
    setStep(2);
  }

  async function handleVerifyOtp(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const { error: verifyError } = await authClient.signIn.emailOtp({
      email: email.trim().toLowerCase(),
      otp: otp.trim(),
    });
    if (verifyError) {
      setLoading(false);
      setError(verifyError.message ?? "Invalid or expired code.");
      return;
    }
    // The server decides what's next: handle picker for new students, /home otherwise.
    router.refresh();
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 sm:p-7">
      <StepPill step={step} />

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger"
        >
          {error}
        </div>
      )}

      {step === 1 && (
        <div>
          <h1 className="text-center text-2xl font-bold">Verify your campus email</h1>
          <p className="mt-1.5 text-center text-sm text-muted">
            Only verified students get in.
          </p>

          {googleEnabled && (
            <>
              <button
                type="button"
                onClick={handleGoogle}
                disabled={loading}
                className="mt-6 w-full rounded-xl bg-white py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:opacity-50"
              >
                Continue with college Google account
              </button>
              <div className="my-4 flex items-center gap-3 text-xs text-muted">
                <div className="h-px flex-1 bg-border" />
                <span>or get a 6-digit code</span>
                <div className="h-px flex-1 bg-border" />
              </div>
            </>
          )}

          <form onSubmit={handleSendOtp} className={`space-y-4 ${googleEnabled ? "" : "mt-6"}`}>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs uppercase tracking-wider text-muted">
                College email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@nst.rishihood.edu.in"
                className={inputClass}
              />
            </div>

            <div className="flex items-start gap-2.5 rounded-xl border border-border bg-surface-2 p-3 text-xs text-muted">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-foreground" />
              <span>Used only to check you&apos;re a student. Never shown or linked to your posts.</span>
            </div>

            <button type="submit" disabled={loading} className={primaryButton}>
              {loading ? "Sending code…" : "Send code"}
            </button>
          </form>
        </div>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyOtp} className="space-y-5">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Enter your code</h1>
            <p className="mt-1.5 text-sm text-muted">
              Sent to {email}. It expires in 5 minutes.
            </p>
          </div>

          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            required
            autoFocus
            aria-label="6-digit code"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            placeholder="000000"
            className="w-full rounded-xl border border-border bg-surface-2 py-3.5 text-center font-pixel text-3xl tracking-[0.5em] focus:border-brand focus:outline-none"
          />

          <button type="submit" disabled={loading || otp.length !== 6} className={primaryButton}>
            {loading ? "Verifying…" : "Verify"}
          </button>

          <button
            type="button"
            onClick={() => {
              setOtp("");
              setError(null);
              setStep(1);
            }}
            className="block w-full text-center text-xs text-muted hover:text-foreground"
          >
            Change email or resend code
          </button>
        </form>
      )}

      {step === 3 && <HandleStep />}
    </div>
  );
}

function StepPill({ step }: { step: Step }) {
  return (
    <div className="mb-5 flex justify-center">
      <div className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs text-brand">
        <span className="font-pixel tracking-wider">STEP {step} OF 3</span>
        <span className="flex gap-1">
          {[1, 2, 3].map((n) => (
            <span key={n} className={`size-2 rounded-sm ${n <= step ? "bg-brand" : "bg-white/15"}`} />
          ))}
        </span>
      </div>
    </div>
  );
}

type RemoteCheck = { handle: string; available: boolean; reason?: string };

function HandleStep() {
  const router = useRouter();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [rerollsLeft, setRerollsLeft] = useState(3);
  const [selected, setSelected] = useState("");
  const [customMode, setCustomMode] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [remote, setRemote] = useState<RemoteCheck | null>(null);
  const [hostelId, setHostelId] = useState<string>(HOSTELS[0]);
  const [batchYear, setBatchYear] = useState<number>(BATCH_YEARS[2]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadSuggestions() {
    const res = await fetch("/api/handles/suggest");
    if (!res.ok) {
      setError("Couldn't load handle ideas. Type your own instead.");
      return;
    }
    const data: { handles: string[] } = await res.json();
    setSuggestions(data.handles);
    setSelected(data.handles[0] ?? "");
  }

  useEffect(() => {
    let cancelled = false;
    fetch("/api/handles/suggest")
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data: { handles: string[] }) => {
        if (cancelled) return;
        setSuggestions(data.handles);
        setSelected(data.handles[0] ?? "");
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load handle ideas. Type your own instead.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Format problems show instantly; availability is checked on the server after a pause.
  const trimmed = customInput.trim();
  const localCheck = validateHandleFormat(trimmed);
  const remoteForInput = remote?.handle === trimmed ? remote : null;

  useEffect(() => {
    if (!customMode || !localCheck.valid) return;
    const timer = setTimeout(async () => {
      const res = await fetch(`/api/handles/check?handle=${encodeURIComponent(trimmed)}`);
      const data = res.ok ? await res.json() : { available: false, reason: "Couldn't check right now." };
      setRemote({ handle: trimmed, ...data });
    }, 350);
    return () => clearTimeout(timer);
  }, [customMode, trimmed, localCheck.valid]);

  const chosen = customMode ? trimmed : selected;
  const canSubmit =
    !loading && Boolean(chosen) && (!customMode || (localCheck.valid && remoteForInput?.available === true));

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setLoading(true);
    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ handle: chosen, hostelId, batchYear }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setLoading(false);
      setError(data.error ?? "Couldn't save. Try again.");
      if (res.status === 409 && !customMode) loadSuggestions();
      return;
    }
    router.replace("/home");
  }

  async function handleSignOut() {
    await authClient.signOut();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Choose your anonymous handle</h1>
        <p className="mt-1 text-xs text-muted">
          You can&apos;t change it later. It&apos;s never linked to your email.
        </p>
      </div>

      {error && (
        <div role="alert" className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
          {error}
        </div>
      )}

      {!customMode ? (
        <div className="space-y-2.5">
          {suggestions.length === 0 && !error && (
            <div className="flex items-center justify-center gap-2 py-6 text-xs text-muted">
              <Loader2 className="size-4 animate-spin" /> Finding free handles…
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
                className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium transition ${
                  active
                    ? "border-brand bg-brand/10 text-foreground"
                    : "border-border bg-surface-2 text-zinc-300 hover:border-white/25"
                }`}
              >
                <span>{handle}</span>
                <span className="text-[11px] text-success">Available</span>
              </button>
            );
          })}

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              disabled={rerollsLeft <= 0}
              onClick={() => {
                setRerollsLeft((n) => n - 1);
                loadSuggestions();
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-xs text-zinc-300 hover:text-foreground disabled:opacity-40"
            >
              <RefreshCw className="size-3.5" />
              New ideas ({rerollsLeft} left)
            </button>
            <button
              type="button"
              onClick={() => setCustomMode(true)}
              className="text-xs text-muted underline hover:text-foreground"
            >
              Type my own
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="handle" className="text-xs text-muted">
              Your handle
            </label>
            <button
              type="button"
              onClick={() => setCustomMode(false)}
              className="text-xs text-brand hover:underline"
            >
              Back to ideas
            </button>
          </div>
          <input
            id="handle"
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="e.g. Midnight-Chai-21"
            maxLength={24}
            autoComplete="off"
            className={inputClass}
          />
          <div className="flex min-h-5 items-center gap-1.5 text-xs" aria-live="polite">
            {trimmed.length > 0 && !localCheck.valid && (
              <span className="inline-flex items-center gap-1 text-danger">
                <XCircle className="size-3.5" /> {localCheck.reason}
              </span>
            )}
            {localCheck.valid && !remoteForInput && (
              <span className="inline-flex items-center gap-1 text-muted">
                <Loader2 className="size-3.5 animate-spin" /> Checking…
              </span>
            )}
            {localCheck.valid && remoteForInput?.available && (
              <span className="inline-flex items-center gap-1 text-success">
                <CheckCircle2 className="size-3.5" /> Available
              </span>
            )}
            {localCheck.valid && remoteForInput && !remoteForInput.available && (
              <span className="inline-flex items-center gap-1 text-danger">
                <XCircle className="size-3.5" /> {remoteForInput.reason}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 pt-1">
        <div>
          <label htmlFor="hostel" className="mb-1 block text-[11px] uppercase tracking-wider text-muted">
            Hostel
          </label>
          <select
            id="hostel"
            value={hostelId}
            onChange={(e) => setHostelId(e.target.value)}
            className={inputClass}
          >
            {HOSTELS.map((hostel) => (
              <option key={hostel} value={hostel}>
                {hostel}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="batch" className="mb-1 block text-[11px] uppercase tracking-wider text-muted">
            Batch
          </label>
          <select
            id="batch"
            value={batchYear}
            onChange={(e) => setBatchYear(Number(e.target.value))}
            className={inputClass}
          >
            {BATCH_YEARS.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button type="submit" disabled={!canSubmit} className={primaryButton}>
        {loading ? "Saving…" : "Enter BBHub"}
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

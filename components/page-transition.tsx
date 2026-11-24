"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useTransition,
  type AnchorHTMLAttributes,
  type CSSProperties,
  type ReactNode,
} from "react";

/**
 * BBHub's page transition: nine red bars rise to cover the screen, the route changes underneath,
 * then the bars lift away. One red (the BB tile colour) for every transition on the site.
 */

type Phase = "idle" | "cover" | "wait" | "reveal";

const NavigateContext = createContext<((href: string) => void) | null>(null);

/** Bar heights in vh. Tallest in the middle, so the leading edge steps like a pyramid. */
const BARS = [104, 112, 120, 128, 136, 128, 120, 112, 104];
/** Must match the CSS: 520ms per bar plus up to 210ms of stagger. */
const COVER_MS = 740;
const REVEAL_MS = 780;
/** If the new page never finishes loading, lift the bars anyway. */
const SAFETY_MS = 6000;

function barStyle(index: number, height: number): CSSProperties {
  return {
    "--i": index,
    "--h": `${height}vh`,
    "--d": Math.abs(index - 4) * 35,
  } as CSSProperties;
}

export function PageTransition({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");
  const [isPending, startTransition] = useTransition();
  const target = useRef<string | null>(null);
  const busy = useRef(false);

  function navigate(href: string) {
    if (busy.current) return;
    busy.current = true;
    target.current = href;
    setPhase("cover");
  }

  useEffect(() => {
    if (phase === "cover") {
      const timer = window.setTimeout(() => {
        setPhase("wait");
        startTransition(() => router.push(target.current ?? "/"));
      }, COVER_MS);
      return () => window.clearTimeout(timer);
    }
    if (phase === "wait") {
      // isPending stays true until the new route has rendered under the bars.
      const timer = window.setTimeout(() => setPhase("reveal"), isPending ? SAFETY_MS : 80);
      return () => window.clearTimeout(timer);
    }
    if (phase === "reveal") {
      const timer = window.setTimeout(() => {
        busy.current = false;
        setPhase("idle");
      }, REVEAL_MS);
      return () => window.clearTimeout(timer);
    }
  }, [phase, isPending, router]);

  return (
    <NavigateContext value={navigate}>
      {children}
      <div className="page-wipe" data-phase={phase} aria-hidden="true">
        {BARS.map((height, index) => (
          <i key={`ghost-${index}`} className="page-wipe__bar page-wipe__bar--ghost" style={barStyle(index, height)} />
        ))}
        {BARS.map((height, index) => (
          <i key={`solid-${index}`} className="page-wipe__bar" style={barStyle(index, height)} />
        ))}
        {/* Only exists while waiting for the next page, so it can never show anywhere else. */}
        {phase === "wait" && <span className="page-wipe__mark">BB</span>}
      </div>
    </NavigateContext>
  );
}

type TransitionLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
  prefetch?: boolean | null;
};

/** A next/link that plays the red page transition for plain left-clicks on internal routes. */
export function TransitionLink({ href, onClick, target, ...rest }: TransitionLinkProps) {
  const navigate = useContext(NavigateContext);
  return (
    <Link
      href={href}
      target={target}
      {...rest}
      onClick={(event) => {
        onClick?.(event);
        if (!navigate || event.defaultPrevented) return;
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        if ((target && target !== "_self") || !href.startsWith("/")) return;
        event.preventDefault();
        navigate(href);
      }}
    />
  );
}

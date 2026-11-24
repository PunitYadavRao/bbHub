"use client";

import "lenis/dist/lenis.css";
import "./landing.css";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import type { SectionId } from "./content";
import type { MotionApi } from "./motion";
import { MenuButton, SiteMenu, type MenuState } from "./site-menu";
import { STAGE_QUERY } from "./stage";

const MENU_CLOSE_MS = 760;

/** Bar heights in vh for each red wipe. Every bar is at least 100vh, so a wipe covers the screen. */
const PROFILES = {
  pyramid: [104, 112, 120, 128, 136, 128, 120, 112, 104],
  valley: [136, 128, 120, 112, 104, 112, 120, 128, 136],
  rise: [104, 108, 113, 118, 122, 127, 131, 136, 140],
  fall: [140, 136, 131, 127, 122, 118, 113, 108, 104],
};

/** One wipe between each pair of scenes. data-from sets the stagger order in motion.ts. */
const WIPES = [
  { id: "w1", profile: PROFILES.pyramid, from: "center" },
  { id: "w2", profile: PROFILES.valley, from: "edges" },
  { id: "w3", profile: PROFILES.rise, from: "end" },
  { id: "w4", profile: PROFILES.fall, from: "start" },
  { id: "w5", profile: PROFILES.pyramid, from: "center" },
  // Past the footer: covers the page, then the stage jumps back to the top (motion.ts).
  { id: "w6", profile: PROFILES.valley, from: "edges" },
];

/** Dots in the cursor blob (see cursor.ts). */
const CURSOR_DOTS = 10;

const vars = (values: Record<string, string | number>) => values as CSSProperties;

function Bars({ profile }: { profile: number[] }) {
  return (
    <>
      {profile.map((height, index) => (
        <i
          key={`ghost-${index}`}
          className="bbh-bar bbh-bar--ghost"
          style={vars({ "--i": index, "--h": `${height}vh` })}
        />
      ))}
      {profile.map((height, index) => (
        <i
          key={`solid-${index}`}
          className="bbh-bar bbh-bar--solid"
          style={vars({ "--i": index, "--h": `${height}vh` })}
        />
      ))}
    </>
  );
}

/** Red load curtain (desktop only). CSS hides it after 3s if the motion code never arrives. */
function Curtain() {
  return (
    <div className="bbh-curtain" aria-hidden="true">
      <Bars profile={PROFILES.pyramid} />
      <div className="bbh-curtain__mark">
        <svg className="bbh-curtain__ring" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="56" />
        </svg>
        <span className="bbh-curtain__tile">BB</span>
      </div>
    </div>
  );
}

export function LandingShell({ authSlot, children }: { authSlot: ReactNode; children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const motion = useRef<MotionApi | null>(null);
  const [menu, setMenu] = useState<MenuState>("closed");
  const [originX, setOriginX] = useState(0);
  // The menu takes the colour that contrasts with the scene it opens over.
  const [menuTheme, setMenuTheme] = useState<"red" | "ink">("red");
  const menuUp = menu !== "closed";

  // Desktop gets the full stage (GSAP, ScrollTrigger, Lenis), downloaded only when the stage
  // query matches. Phones and tablets get the lighter mode: the glowing mesh plus scroll
  // reveals on the stacked layout. Reduced-motion visitors get the plain static page.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const stage = window.matchMedia(STAGE_QUERY);
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    let cancelled = false;
    let motionRequested = false;
    let liteRequested = false;
    let stopLite: (() => void) | null = null;

    const sync = () => {
      if (stage.matches) {
        stopLite?.();
        stopLite = null;
        if (motionRequested) return;
        motionRequested = true;
        import("./motion")
          .then(({ startMotion }) => {
            if (!cancelled) motion.current = startMotion(root);
          })
          .catch(() => {
            motionRequested = false;
          });
        return;
      }
      if (still.matches) {
        stopLite?.();
        stopLite = null;
        return;
      }
      if (stopLite || liteRequested) return;
      liteRequested = true;
      import("./lite")
        .then(({ startLite }) => {
          liteRequested = false;
          if (!cancelled && !stopLite && !stage.matches && !still.matches) stopLite = startLite(root);
        })
        .catch(() => {
          liteRequested = false;
        });
    };

    sync();
    stage.addEventListener("change", sync);
    still.addEventListener("change", sync);
    return () => {
      cancelled = true;
      stage.removeEventListener("change", sync);
      still.removeEventListener("change", sync);
      stopLite?.();
      stopLite = null;
      motion.current?.destroy();
      motion.current = null;
    };
  }, []);

  // Pixel click: every click or tap bursts eight pixel rays from the point, in three hard steps
  // like an 8-bit sprite. The colour contrasts with what is under the click: brand red on black,
  // white on red (red scenes, red wipes, the red menu).
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    const RAYS = [
      [0, -1],
      [1, -1],
      [1, 0],
      [1, 1],
      [0, 1],
      [-1, 1],
      [-1, 0],
      [-1, -1],
    ];
    const overRed = (x: number, y: number) => {
      const menu = root.dataset.menuOpen;
      if (menu) return menu === "red";
      if (root.dataset.stage === "on") return root.dataset.sceneTone === "red";
      const scene = document.elementFromPoint(x, y)?.closest<HTMLElement>("[data-scene]");
      return scene?.dataset.scene === "intro" || scene?.dataset.scene === "drop";
    };
    const onDown = (event: PointerEvent) => {
      if (still.matches || event.button !== 0) return;
      const burst = document.createElement("span");
      burst.className = "bbh-burst";
      burst.setAttribute("aria-hidden", "true");
      burst.style.left = `${Math.round(event.clientX)}px`;
      burst.style.top = `${Math.round(event.clientY)}px`;
      burst.style.setProperty("--c", overRed(event.clientX, event.clientY) ? "#fff" : "var(--brand)");
      for (const [dx, dy] of RAYS) {
        const ray = document.createElement("i");
        ray.style.setProperty("--dx", String(dx));
        ray.style.setProperty("--dy", String(dy));
        burst.append(ray);
      }
      burst.addEventListener("animationend", () => burst.remove(), { once: true });
      root.append(burst);
    };
    root.addEventListener("pointerdown", onDown);
    return () => {
      root.removeEventListener("pointerdown", onDown);
      root.querySelectorAll(".bbh-burst").forEach((burst) => burst.remove());
    };
  }, []);

  // Feature cards: a spotlight and border glow follow the pointer, and the card tilts toward it.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let active: HTMLElement | null = null;
    const reset = (card: HTMLElement) => {
      for (const name of ["--mx", "--my", "--rx", "--ry"]) card.style.removeProperty(name);
    };
    const onMove = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      const card = target?.closest<HTMLElement>(".bbh-card") ?? null;
      if (active && active !== card) reset(active);
      active = card;
      if (!card) return;
      const box = card.getBoundingClientRect();
      const x = event.clientX - box.left;
      const y = event.clientY - box.top;
      card.style.setProperty("--mx", `${x}px`);
      card.style.setProperty("--my", `${y}px`);
      card.style.setProperty("--rx", `${((y / box.height - 0.5) * -6).toFixed(2)}deg`);
      card.style.setProperty("--ry", `${((x / box.width - 0.5) * 8).toFixed(2)}deg`);
    };
    const onLeave = () => {
      if (active) reset(active);
      active = null;
    };
    root.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      root.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      onLeave();
    };
  }, []);

  useEffect(() => {
    if (menu !== "closing") return;
    const timer = window.setTimeout(() => setMenu("closed"), MENU_CLOSE_MS);
    return () => window.clearTimeout(timer);
  }, [menu]);

  // While the menu is up, freeze page scrolling and let Escape close it.
  useEffect(() => {
    if (!menuUp) return;
    const api = motion.current;
    const html = document.documentElement;
    if (api?.isActive()) api.setPaused(true);
    else html.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMenu((state) => (state === "open" ? "closing" : state));
      menuButtonRef.current?.focus({ preventScroll: true });
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (api?.isActive()) api.setPaused(false);
      html.style.removeProperty("overflow");
      // Next.js keeps this page alive (hidden) after you navigate away, state included. If the
      // visitor left through a menu link, close the menu so it isn't still open when they return.
      setMenu("closed");
    };
  }, [menuUp]);

  function toggleMenu() {
    if (menu === "closing") return;
    if (menu === "open") {
      setMenu("closing");
      return;
    }
    const rect = menuButtonRef.current?.getBoundingClientRect();
    setOriginX(rect ? rect.left + rect.width / 2 : window.innerWidth - 40);
    setMenuTheme(rootRef.current?.dataset.sceneTone === "red" ? "ink" : "red");
    setMenu("open");
  }

  // Jump while the closing menu still covers the screen, so the visitor lands on the section.
  function goToSection(id: SectionId) {
    setMenu("closing");
    menuButtonRef.current?.focus({ preventScroll: true });
    const api = motion.current;
    if (api?.isActive()) api.scrollTo(id);
    else document.getElementById(id)?.scrollIntoView({ block: "start" });
  }

  function backToTop(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    const api = motion.current;
    if (api?.isActive()) {
      api.scrollTo("top");
      return;
    }
    const instant = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: instant ? "auto" : "smooth" });
  }

  return (
    <div ref={rootRef} className="bbh-landing" data-menu-open={menuUp ? menuTheme : undefined}>
      <Curtain />

      <header className="bbh-header">
        <Link href="/" className="bbh-logo" onClick={backToTop} aria-label="BackBencher Hub, back to top">
          <Image src="/icon-192.png" alt="" width={40} height={40} priority className="bbh-logo__tile" />
          <span className="bbh-logo__word" aria-hidden="true">
            <span className="bbh-b">B</span>ack<span className="bbh-b">B</span>encher Hub
          </span>
        </Link>
        <div className="bbh-header__actions">
          {authSlot}
          <MenuButton ref={menuButtonRef} open={menu === "open"} onToggle={toggleMenu} />
        </div>
      </header>

      <SiteMenu state={menu} originX={originX} onSection={goToSection} />

      <main className="bbh-main" inert={menuUp}>
        {children}
        <div className="bbh-spacer" aria-hidden="true" />
      </main>

      <div className="bbh-wipes" aria-hidden="true">
        {WIPES.map((wipe) => (
          <div key={wipe.id} className="bbh-wipe" data-wipe={wipe.id} data-from={wipe.from}>
            <Bars profile={wipe.profile} />
          </div>
        ))}
      </div>

      {/* Drifting triangle mesh over the stage (mesh.ts). */}
      <canvas className="bbh-mesh" aria-hidden="true" />

      <div className="bbh-rail" aria-hidden="true">
        <i className="bbh-rail__dot" />
      </div>

      {/* Goo filter: blurs the cursor dots together, then sharpens the edge back up. */}
      <svg className="bbh-goo" aria-hidden="true" focusable="false">
        <filter id="bbh-goo">
          <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 35 -15" result="goo" />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
      </svg>
      <div className="bbh-cursor" aria-hidden="true">
        {Array.from({ length: CURSOR_DOTS }, (_, index) => (
          <i key={index} />
        ))}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, type CSSProperties, type Ref } from "react";
import { TransitionLink } from "@/components/page-transition";
import { MENU_LINKS, type SectionId } from "./content";

export type MenuState = "closed" | "open" | "closing";

/** Round menu button. Its short lines swap sides on hover and it turns into an X when open. */
export function MenuButton({
  open,
  onToggle,
  ref,
}: {
  open: boolean;
  onToggle: () => void;
  ref?: Ref<HTMLButtonElement>;
}) {
  return (
    <button
      ref={ref}
      type="button"
      className="bbh-menu-btn"
      aria-expanded={open}
      aria-controls="bbh-menu"
      onClick={onToggle}
    >
      <span className="sr-only">{open ? "Close menu" : "Menu"}</span>
      <span className="bbh-menu-btn__lines" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
    </button>
  );
}

/** Two copies of a label: the first rolls up and out on hover, the second rolls in. */
function Roll({ label }: { label: string }) {
  return (
    <span className="bbh-roll">
      <span className="bbh-roll__a">{label}</span>
      <span className="bbh-roll__b" aria-hidden="true">
        {label}
      </span>
    </span>
  );
}

/**
 * Full-screen red menu. A narrow column drops from the menu button, widens to fill the screen,
 * then the links rise in one by one. Closing plays it in reverse.
 */
export function SiteMenu({
  state,
  originX,
  onSection,
}: {
  state: MenuState;
  originX: number;
  onSection: (id: SectionId) => void;
}) {
  const nav = useRef<HTMLElement>(null);

  useEffect(() => {
    if (state === "open") {
      nav.current?.querySelector<HTMLElement>(".bbh-menu__link")?.focus({ preventScroll: true });
    }
  }, [state]);

  return (
    <div
      id="bbh-menu"
      className="bbh-menu"
      data-state={state}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      inert={state !== "open"}
      style={{ "--ox": `${originX}px` } as CSSProperties}
    >
      <div className="bbh-menu__ghost" />
      <div className="bbh-menu__bg" />
      <nav ref={nav} className="bbh-menu__nav" aria-label="Site">
        <ul className="bbh-menu__list">
          {MENU_LINKS.map((item, index) => (
            <li key={item.label} className="bbh-menu__item" style={{ "--i": index } as CSSProperties}>
              {"href" in item ? (
                <TransitionLink href={item.href} className="bbh-menu__link">
                  <Roll label={item.label} />
                </TransitionLink>
              ) : (
                <button type="button" className="bbh-menu__link" onClick={() => onSection(item.section)}>
                  <Roll label={item.label} />
                </button>
              )}
            </li>
          ))}
        </ul>
        <p className="bbh-menu__note">Student-run · Not affiliated with university administration</p>
      </nav>
    </div>
  );
}

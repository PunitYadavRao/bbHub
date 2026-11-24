import { startMesh } from "./mesh";

/**
 * Phones, tablets and narrow windows (anything outside STAGE_QUERY, when motion is allowed):
 * the stacked page stays, but it gets the glowing mesh and scroll reveals. Masked lines slide
 * up, blocks fade up in small staggers, and the hero title builds letter by letter. Everything
 * is visible without this script; the hiding styles only apply while `data-reveal="on"`.
 */

const FADES = [
  ".bbh-tagline",
  ".bbh-hero__cta",
  ".bbh-cue",
  ".bbh-track > li",
  ".bbh-drop__slogan",
  ".bbh-drop__count",
  ".bbh-drop__cta",
  "[data-vault-part]",
  ".bbh-vault__cta",
  "[data-reveal]",
  ".bbh-edge__icon",
  ".bbh-col__glyph",
].join(", ");

/** Scenes with a red background. */
const RED_SCENES = new Set(["intro", "drop"]);

/** Elements in the same group reveal one after another. */
const GROUP = "ol, ul, h2, .bbh-statement__text, .bbh-hero__below, .bbh-drop__info, .bbh-vault__diagram, .bbh-footer__content, .bbh-edge, .bbh-col";

export function startLite(root: HTMLElement): () => void {
  const canvas = root.querySelector<HTMLCanvasElement>(".bbh-mesh");
  const stopMesh = canvas ? startMesh(canvas, { light: true }) : () => {};

  const lines = Array.from(root.querySelectorAll<HTMLElement>(".bbh-line"));
  const fades = Array.from(root.querySelectorAll<HTMLElement>(FADES));
  const title = root.querySelector<HTMLElement>(".bbh-hero__title");
  const chars = Array.from(root.querySelectorAll<HTMLElement>(".bbh-hero__title .bbh-char"));
  const targets = [...lines, ...fades];

  chars.forEach((char, index) => char.style.setProperty("--ci", String(index)));
  fades.forEach((el) => el.setAttribute("data-rv", ""));
  const counts = new Map<Element, number>();
  for (const el of targets) {
    const group = el.parentElement?.closest(GROUP) ?? el.parentElement;
    if (!group) continue;
    const order = counts.get(group) ?? 0;
    counts.set(group, order + 1);
    el.style.setProperty("--rv-d", `${Math.min(order, 8) * 80}ms`);
  }
  root.dataset.reveal = "on";

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.setAttribute("data-in", "");
        observer.unobserve(entry.target);
      }
    },
    // No bottom inset: at the end of the page the last items can sit right at the screen's
    // bottom edge and must still reveal.
    // Low enough that the next card peeking into the carousel shows too.
    { threshold: 0.1 },
  );
  // Navbar: while the hero is mostly on screen the full bar shows; past it, the logo and Log in
  // leave and the menu button moves to the top centre (same data-nav switch as the desktop stage).
  const hero = root.querySelector<HTMLElement>('[data-scene="hero"]');
  root.dataset.nav = "full";
  const heroWatch = new IntersectionObserver(
    ([entry]) => {
      root.dataset.nav = entry.intersectionRatio > 0.35 ? "full" : "center";
    },
    { threshold: [0, 0.35, 0.6, 1] },
  );
  if (hero) heroWatch.observe(hero);

  // Tone of the scene under the navbar, so the menu button and the menu theme match the page.
  const toneWatch = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const scene = (entry.target as HTMLElement).dataset.scene ?? "";
        root.setAttribute("data-scene-tone", RED_SCENES.has(scene) ? "red" : "dark");
      }
    },
    { rootMargin: "0px 0px -94% 0px" },
  );
  root.querySelectorAll<HTMLElement>("[data-scene]").forEach((scene) => toneWatch.observe(scene));

  // Observe after the hidden state has painted, so the first reveals animate too.
  const start = requestAnimationFrame(() => {
    if (title) observer.observe(title);
    targets.forEach((el) => observer.observe(el));
  });

  return () => {
    cancelAnimationFrame(start);
    observer.disconnect();
    heroWatch.disconnect();
    toneWatch.disconnect();
    stopMesh();
    delete root.dataset.nav;
    root.removeAttribute("data-scene-tone");
    delete root.dataset.reveal;
    for (const el of [...targets, ...(title ? [title] : [])]) {
      el.removeAttribute("data-rv");
      el.removeAttribute("data-in");
      el.style.removeProperty("--rv-d");
    }
    chars.forEach((char) => char.style.removeProperty("--ci"));
  };
}

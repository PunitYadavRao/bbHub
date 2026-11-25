import gsap from "gsap";
import { Observer } from "gsap/Observer";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import type { SectionId } from "./content";
import { startCursor } from "./cursor";
import { startMesh } from "./mesh";
import { STAGE_QUERY } from "./stage";

/**
 * Desktop choreography for the landing page (see docs/landing-motion-spec.md).
 *
 * Every scene is a fixed, full-screen layer. A tall spacer gives the page its scroll length and
 * one master timeline, scrubbed by ScrollTrigger, plays the scenes and the red bar wipes between
 * them. Lenis smooths the scroll. Everything is created inside gsap.matchMedia(), so leaving the
 * desktop query (or unmounting) reverts every tween, ScrollTrigger and inline style.
 */

gsap.registerPlugin(ScrollTrigger, Observer);

/** Scroll distance, in vh, for one second of the master timeline. */
const VH_PER_SECOND = 62;
/** Travel time for one layer of wipe bars. */
const WIPE = 0.55;
/** The translucent layer leads (or trails) the solid one by this much. */
const WIPE_LEAD = 0.08;
/** Total stagger across the nine bars. */
const WIPE_SPREAD = 0.24;
const WIPE_TOTAL = WIPE_LEAD + WIPE + WIPE_SPREAD;

type StaggerFrom = "center" | "edges" | "start" | "end";
type Wipe = { ghosts: HTMLElement[]; solids: HTMLElement[]; from: StaggerFrom };

export type MotionApi = {
  isActive(): boolean;
  setPaused(paused: boolean): void;
  scrollTo(target: SectionId | "top"): void;
  destroy(): void;
};

export function startMotion(root: HTMLElement): MotionApi {
  const mm = gsap.matchMedia();
  let lenis: Lenis | null = null;
  let trigger: ScrollTrigger | null = null;
  let jump: ((y: number) => void) | null = null;

  mm.add(STAGE_QUERY, () => {
    const html = document.documentElement;
    const one = (selector: string) => root.querySelector<HTMLElement>(selector) as HTMLElement;
    const all = (selector: string) => Array.from(root.querySelectorAll<HTMLElement>(selector));
    const within = (parent: HTMLElement, selector: string) =>
      Array.from(parent.querySelectorAll<HTMLElement>(selector));

    root.dataset.stage = "on";
    root.setAttribute("data-scene-tone", "dark");
    root.setAttribute("data-nav", "full");
    html.classList.add("bbh-stage");

    // The stage always starts at the top, under the load curtain. When a visitor comes back to
    // this page, Next.js shows the preserved page with its old scroll position; starting the
    // scroll timeline part-way down would play the intro over the wrong scene.
    window.scrollTo(0, 0);

    // Smooth scrolling on GSAP's ticker, so Lenis and ScrollTrigger share one clock.
    // Touch screens are paged: one swipe glides to the next scene (see "Paged touch" below), so
    // Lenis leaves touch alone there. Wheels and trackpads scroll smoothly as usual.
    const paged = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
    const smooth = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, syncTouch: false });
    lenis = smooth;
    smooth.scrollTo(0, { immediate: true, force: true });
    smooth.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => smooth.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Move without animating, and skip the scrub's catch-up so no scenes flash past.
    const jumpTo = (y: number) => {
      smooth.scrollTo(y, { immediate: true, force: true });
      ScrollTrigger.update();
      trigger?.getTween()?.progress(1);
    };
    jump = jumpTo;

    // Elements ---------------------------------------------------------------------------------
    const scene = (name: string) => one(`[data-scene="${name}"]`);
    const hero = scene("hero");
    const statement = scene("statement");
    const intro = scene("intro");
    const inside = scene("inside");
    const drop = scene("drop");
    const vault = scene("vault");
    const footer = scene("footer");

    const [w1, w2, w3, w4, w5, w6] = ["w1", "w2", "w3", "w4", "w5", "w6"].map<Wipe>((id) => {
      const wipe = one(`[data-wipe="${id}"]`);
      return {
        ghosts: within(wipe, ".bbh-bar--ghost"),
        solids: within(wipe, ".bbh-bar--solid"),
        from: (wipe.dataset.from ?? "center") as StaggerFrom,
      };
    });

    const header = one(".bbh-header");
    const curtain = one(".bbh-curtain");
    const curtainMark = one(".bbh-curtain__mark");
    const cols = one(".bbh-cols");
    const glyphs = all(".bbh-col__glyph");
    const echoes = all(".bbh-char__echo");
    const mains = all(".bbh-char__main");
    const tagline = one(".bbh-tagline");
    const heroCta = one(".bbh-hero__cta");
    const cueInner = one(".bbh-cue__inner");

    const insideHead = one(".bbh-inside__head");
    const panel = one(".bbh-inside__panel");
    const track = one(".bbh-track");
    const slogan = one(".bbh-drop__slogan");
    const dropCount = one(".bbh-drop__count");
    const dropCta = one(".bbh-drop__cta");
    const vaultParts = all("[data-vault-part]");
    const vaultCta = one(".bbh-vault__cta");
    const footerItems = within(footer, "[data-reveal]");

    // Starting states, written out in full every time the stage starts. Only the hero is
    // visible; every other line waits below its clip.
    //
    // Why every property is set explicitly: when the visitor leaves, Next.js hides this page
    // (display: none) before its effects clean up, so GSAP's revert runs on hidden elements and
    // can leave stray inline transforms behind. A wipe bar left at translate(0, 0) covers the
    // whole screen in red once the next run scrolls back past it. Setting each animated property
    // here first means nothing from a previous run can leak into this one.
    gsap.set(all(".bbh-wipe .bbh-bar"), { x: 0, xPercent: 0, y: 0, yPercent: 100 });
    gsap.set(within(curtain, ".bbh-bar"), { y: 0, yPercent: 0 });
    gsap.set(curtainMark, { autoAlpha: 1, scale: 1 });
    gsap.set(hero, { autoAlpha: 1 });
    gsap.set([statement, intro, inside, drop, vault, footer], { autoAlpha: 0 });
    gsap.set(
      all(
        ".bbh-statement .bbh-line__inner, .bbh-intro .bbh-line__inner, .bbh-inside .bbh-line__inner, .bbh-drop .bbh-line__inner, .bbh-vault .bbh-line__inner",
      ),
      { yPercent: 110 },
    );
    gsap.set(all(".bbh-char__move"), { yPercent: 0 });
    gsap.set([...echoes, ...mains], { yPercent: 115, autoAlpha: 1 });
    gsap.set([tagline, heroCta, cueInner], { autoAlpha: 0, y: 18 });
    gsap.set([one(".bbh-hero__below"), one(".bbh-cue")], { autoAlpha: 1, y: 0 });
    gsap.set(header, { autoAlpha: 0, y: -14 });
    gsap.set(cols, { autoAlpha: 0, scale: 1.1 });
    gsap.set([one(".bbh-col--l"), one(".bbh-col--r")], { xPercent: 0, autoAlpha: 1 });
    gsap.set(glyphs, { x: 0, y: 0 });
    gsap.set(insideHead, { y: 0, scale: 1 });
    gsap.set(panel, { yPercent: 102 });
    gsap.set(slogan, { autoAlpha: 0, y: 0, scale: 1 });
    gsap.set(one(".bbh-drop__content"), { autoAlpha: 1, y: 0 });
    gsap.set([dropCount, dropCta, ...vaultParts, vaultCta], { autoAlpha: 0, y: 26 });
    gsap.set(footerItems, { autoAlpha: 0, y: 36 });
    gsap.set(one(".bbh-rail__dot"), { x: 0, y: 0 });

    // Load: the red curtain lifts, then the title builds letter by letter. A red echo of each
    // letter passes up through its slot just ahead of the white letter. The end-of-page loop
    // replays it (without the BB mark; the header is already in place by then).
    curtain.style.animation = "none";
    const up = () => -window.innerHeight;
    const curtainBars = within(curtain, ".bbh-bar");
    const playIntro = (first: boolean) => {
      gsap.set(curtain, { display: "block" });
      gsap.set(curtainBars, { y: 0, yPercent: 0 });
      gsap.set(curtainMark, first ? { autoAlpha: 1, scale: 1 } : { autoAlpha: 0 });
      gsap.set([...echoes, ...mains], { yPercent: 115, autoAlpha: 1 });
      gsap.set([tagline, heroCta, cueInner], { autoAlpha: 0, y: 18 });
      gsap.set(cols, { autoAlpha: 0, scale: 1.1 });
      const intro = gsap
        .timeline({ delay: first ? 0.2 : 0.05 })
        // A late scroll restore (or a wheel turn while the curtain was up) could have moved the
        // page; settle back at the top before the curtain lifts.
        .call(() => jumpTo(0), [], first ? 0.3 : 0)
        .to(
          within(curtain, ".bbh-bar--solid"),
          { y: up, duration: 0.85, ease: "power3.inOut", stagger: { amount: 0.22, from: "center" } },
          0.6,
        )
        .to(
          within(curtain, ".bbh-bar--ghost"),
          { y: up, duration: 0.85, ease: "power3.inOut", stagger: { amount: 0.22, from: "center" } },
          0.72,
        )
        .set(curtain, { display: "none" })
        .to(cols, { autoAlpha: 1, scale: 1, duration: 1.6, ease: "power3.out" }, 1)
        .to(echoes, { yPercent: -115, duration: 0.9, ease: "power2.inOut", stagger: 0.045 }, 1)
        .to(mains, { yPercent: 0, duration: 0.8, ease: "power3.out", stagger: 0.045 }, 1.18)
        // Once the echoes have passed, hide them so the scroll exit can't drag them back into view.
        .set(echoes, { autoAlpha: 0 }, 2.6)
        .to([tagline, heroCta], { autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.12 }, 1.75)
        .to(cueInner, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out" }, 2.2);
      if (first) {
        intro
          .to(curtainMark, { autoAlpha: 0, scale: 0.85, duration: 0.4, ease: "power2.in" }, 0.35)
          .to(header, { autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out" }, 1.3);
      }
      return intro;
    };
    playIntro(true);

    // Background mesh and the blob cursor run for as long as the stage does.
    // Phones and tablets get the lighter mesh (fewer points, 30fps).
    const stopMesh = startMesh(one(".bbh-mesh") as HTMLCanvasElement, { light: window.innerWidth < 1024 });
    const stopCursor = startCursor(root, one(".bbh-cursor"));

    // Pointer: the hero icons drift by depth.
    const glyphX = glyphs.map((glyph) => gsap.quickTo(glyph, "x", { duration: 1.6, ease: "power3" }));
    const glyphY = glyphs.map((glyph) => gsap.quickTo(glyph, "y", { duration: 1.6, ease: "power3" }));

    const onPointerMove = (event: PointerEvent) => {
      const nx = event.clientX / window.innerWidth - 0.5;
      const ny = event.clientY / window.innerHeight - 0.5;
      glyphs.forEach((_, i) => {
        const depth = 0.6 + (i % 3) * 0.45;
        glyphX[i](nx * -13 * depth);
        glyphY[i](ny * -10 * depth);
      });
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    // Master timeline. One timeline second is VH_PER_SECOND of scroll. -------------------------
    //
    // Every step states its start AND end values (fromTo), renders only once the playhead
    // reaches it, and writes immediately (no lazy first render). Nothing depends on values GSAP
    // recorded earlier, so the timeline lands in the same state however it gets there:
    // scrolling either way, a menu jump, or a fresh start part-way down the page.
    const tl = gsap.timeline({ defaults: { ease: "none", lazy: false, immediateRender: false } });

    const step = (targets: gsap.TweenTarget, from: gsap.TweenVars, to: gsap.TweenVars, at: number) =>
      tl.fromTo(targets, from, to, at);
    /** An instant switch at `at`; scrolling back past it restores `from`. */
    const flip = (targets: gsap.TweenTarget, from: gsap.TweenVars, to: gsap.TweenVars, at: number) =>
      tl.fromTo(targets, from, { ...to, duration: 0 }, at);

    const rise = (targets: gsap.TweenTarget, at: number, vars: gsap.TweenVars = {}) =>
      step(targets, { yPercent: 110 }, { yPercent: 0, duration: 0.5, ease: "power3.out", stagger: 0.1, ...vars }, at);
    const sink = (targets: gsap.TweenTarget, at: number, vars: gsap.TweenVars = {}) =>
      step(targets, { yPercent: 0 }, { yPercent: -110, duration: 0.35, ease: "power2.in", stagger: 0.05, ...vars }, at);
    const appear = (targets: gsap.TweenTarget, at: number, vars: gsap.TweenVars = {}) =>
      step(targets, { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: "power3.out", ...vars }, at);
    const swap = (from: HTMLElement[], to: HTMLElement, at: number) => {
      flip(from, { autoAlpha: 1 }, { autoAlpha: 0 }, at);
      flip(to, { autoAlpha: 0 }, { autoAlpha: 1 }, at);
    };
    let currentNav = "full";
    const nav = (value: "center" | "full", at: number) => {
      flip(root, { attr: { "data-nav": currentNav } }, { attr: { "data-nav": value } }, at);
      currentNav = value;
    };
    let currentTone = "dark";
    const tone = (value: "red" | "dark", at: number) => {
      flip(root, { attr: { "data-scene-tone": currentTone } }, { attr: { "data-scene-tone": value } }, at);
      currentTone = value;
    };

    const bars = (from: StaggerFrom, vars: gsap.TweenVars): gsap.TweenVars => ({
      duration: WIPE,
      ease: "power2.inOut",
      stagger: { amount: WIPE_SPREAD, from },
      ...vars,
    });
    // Red bars rise from below until they cover the screen. Returns when the last bar lands.
    const cover = (wipe: Wipe, at: number) => {
      step(wipe.ghosts, { yPercent: 100, y: 0 }, bars(wipe.from, { yPercent: 0 }), at);
      step(wipe.solids, { yPercent: 100, y: 0 }, bars(wipe.from, { yPercent: 0 }), at + WIPE_LEAD);
      return at + WIPE_TOTAL;
    };
    // Red bars lift off the top. The solid layer leaves first and the translucent one trails it.
    const lift = (wipe: Wipe, at: number) => {
      step(wipe.solids, { yPercent: 0, y: 0 }, bars(wipe.from, { y: up }), at);
      step(wipe.ghosts, { yPercent: 0, y: 0 }, bars(wipe.from, { y: up }), at + WIPE_LEAD);
      return at + WIPE_TOTAL;
    };
    // Snap bars in or out where the jump can't be seen (red bars against a red scene).
    const park = (wipe: Wipe, at: number, covering: boolean) =>
      flip(
        [...wipe.ghosts, ...wipe.solids],
        { yPercent: covering ? 100 : 0, y: 0 },
        { yPercent: covering ? 0 : 100, y: 0 },
        at,
      );

    // 1. Hero: the title drops out of its clips and the side icons slide away. The logo and
    //    Log in leave the navbar and the menu button moves to the top centre. Then the
    //    two-line statement rises.
    nav("center", 0.3);
    step(one(".bbh-cue"), { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: 30, duration: 0.3 }, 0);
    step(all(".bbh-char__move"), { yPercent: 0 }, { yPercent: 112, duration: 0.55, ease: "power2.in", stagger: { amount: 0.3 } }, 0.15);
    step(one(".bbh-hero__below"), { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -40, duration: 0.5, ease: "power2.in" }, 0.15);
    step(one(".bbh-col--l"), { xPercent: 0, autoAlpha: 1 }, { xPercent: -40, autoAlpha: 0, duration: 1, ease: "power2.in" }, 0.1);
    step(one(".bbh-col--r"), { xPercent: 0, autoAlpha: 1 }, { xPercent: 40, autoAlpha: 0, duration: 1, ease: "power2.in" }, 0.1);
    flip(statement, { autoAlpha: 0 }, { autoAlpha: 1 }, 0.85);
    const statementLines = within(statement, ".bbh-line__inner");
    rise(statementLines, 0.9, { duration: 0.55, stagger: 0.18 });
    /** When the statement has fully risen (a resting point for paged touch). */
    const statementRest = 1.75;
    sink(statementLines, 2.2, { stagger: 0.08 });

    // 2. Red bars rise and stay: they become the red background of "What's this place?".
    let at = cover(w1, 2.45);
    tone("red", at - 0.12);
    swap([hero, statement], intro, at);
    park(w1, at + 0.01, false);
    const introLines = within(intro, ".bbh-line__inner");
    rise(introLines[0], at + 0.1, { duration: 0.5 });
    rise(introLines.slice(1), at + 0.35, { stagger: 0.22 });
    tl.addLabel("about", at + 1.1);
    at += 2.3;
    sink(introLines, at, { stagger: 0.05 });

    // 3. The red lifts away to reveal "Inside the Bench". The title docks at the top, a panel
    //    rises and the six cards slide right to left as you scroll.
    at += 0.45;
    park(w2, at, true);
    swap([intro], inside, at + 0.005);
    const lifted = lift(w2, at + 0.01);
    tone("dark", lifted - 0.15);
    rise(within(inside, ".bbh-line__inner"), at + 0.35, { duration: 0.55, stagger: 0.12 });
    at = lifted + 0.35;
    step(
      insideHead,
      { y: 0, scale: 1 },
      { y: () => -(window.innerHeight * 0.35 - 40), scale: 0.46, duration: 0.7, ease: "power2.inOut" },
      at,
    );
    step(panel, { yPercent: 102 }, { yPercent: 0, duration: 0.7, ease: "power2.inOut" }, at);
    // The track's first tween renders straight away, so it waits off-screen as the panel rises.
    const trackAt = at + 0.45;
    const TRACK_TIME = 3;
    tl.fromTo(
      track,
      { x: () => window.innerWidth * 0.92 },
      { x: () => -(track.scrollWidth - window.innerWidth), duration: TRACK_TIME, immediateRender: true },
      trackAt,
    );
    // Menu jumps land part-way along the track, with the first cards in view.
    tl.addLabel("inside", at + 0.45 + 1.3);
    at += 0.45 + 3 + 0.25;

    // 4. Red bars rise into the 9 PM Daily Drop. "from zero to crown" climbs up under the title.
    at = cover(w3, at);
    tone("red", at - 0.12);
    swap([inside], drop, at);
    park(w3, at + 0.01, false);
    const dropLines = within(drop, ".bbh-line__inner");
    rise(dropLines[0], at + 0.1, { duration: 0.5 });
    step(
      slogan,
      { y: () => window.innerHeight * 0.3, scale: 1.6, autoAlpha: 0 },
      { y: 0, scale: 1, autoAlpha: 1, duration: 0.9, ease: "power2.out" },
      at + 0.15,
    );
    appear(dropCount, at + 0.95);
    rise(dropLines.slice(1), at + 1.05, { stagger: 0.15 });
    appear(dropCta, at + 1.45);
    tl.addLabel("drop", at + 1.9);
    at += 2.9;
    step(one(".bbh-drop__content"), { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -50, duration: 0.4, ease: "power2.in" }, at);

    // 5. The red lifts away to reveal Two-Vault Anonymity.
    at += 0.45;
    park(w4, at, true);
    swap([drop], vault, at + 0.005);
    const lifted4 = lift(w4, at + 0.01);
    tone("dark", lifted4 - 0.15);
    const vaultLines = within(vault, ".bbh-line__inner");
    rise(vaultLines.slice(0, 2), at + 0.35, { stagger: 0.12 });
    appear(vaultParts, at + 0.6, { duration: 0.5, stagger: 0.15 });
    rise(vaultLines.slice(2), at + 0.75, { stagger: 0.12 });
    appear(vaultCta, at + 1.2);
    tl.addLabel("vault", at + 1.6);
    at += 2.7;

    // 6. A full red wipe-through into the footer.
    at = cover(w5, at);
    tone("red", at - 0.12);
    swap([vault], footer, at);
    const lifted5 = lift(w5, at + 0.08);
    tone("dark", lifted5 - 0.15);
    step(footerItems, { autoAlpha: 0, y: 36 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: "power3.out", stagger: 0.08 }, at + 0.35);
    tl.addLabel("footer", lifted5 + 0.1);
    tl.to({}, { duration: 0.6 }, lifted5 + 0.1);

    // 7. Scrolling on past the footer: a last wipe covers the page (the loop below then takes
    //    the visitor back to the top, like the reference site).
    const covered6 = cover(w6, lifted5 + 1);
    tone("red", covered6 - 0.12);
    tl.to({}, { duration: 0.15 }, covered6);

    // Scroll length follows the timeline, then ScrollTrigger scrubs it.
    const spacer = one(".bbh-spacer");
    spacer.style.height = `${Math.round(tl.duration() * VH_PER_SECOND + 100)}vh`;
    const rail = one(".bbh-rail");
    const railDot = one(".bbh-rail__dot");
    const moveDot = gsap.quickTo(railDot, "y", { duration: 0.25, ease: "power3" });
    trigger = ScrollTrigger.create({
      trigger: spacer,
      start: "top top",
      end: "bottom bottom",
      animation: tl,
      scrub: 0.6,
      invalidateOnRefresh: true,
      onUpdate: (self) => moveDot(self.progress * (rail.clientHeight - railDot.clientHeight)),
    });

    // When the last wipe has covered the page, jump to the top under the red curtain and play
    // the intro again. Scrolling is held until the curtain has lifted.
    let looping = false;
    tl.eventCallback("onUpdate", () => {
      if (looping || tl.progress() < 0.999) return;
      looping = true;
      smooth.stop();
      const replay = playIntro(false);
      jumpTo(0);
      replay.eventCallback("onComplete", () => {
        smooth.start();
        looping = false;
      });
    });

    // Paged touch ------------------------------------------------------------------------------
    // On phones and tablets one swipe = one scene: each swipe glides the stage to the next (or
    // previous) resting point at the same pace as the laptop transitions, so a flick can't fling
    // past scenes. Native touch scrolling is off while this runs (html.bbh-paged in the CSS).
    let swipes: Observer | null = null;
    let stopPaging = () => {};
    if (paged) {
      html.classList.add("bbh-paged");
      const toScroll = (time: number) =>
        trigger ? trigger.start + (time / tl.duration()) * (trigger.end - trigger.start) : 0;
      // One stop per card on phones; on wider screens a stop covers about a screen of cards.
      const cardStops = () => {
        const vw = window.innerWidth;
        const from = vw * 0.92;
        const to = -(track.scrollWidth - vw);
        const times: number[] = [];
        let lastX = Number.POSITIVE_INFINITY;
        for (const card of Array.from(track.children) as HTMLElement[]) {
          const x = Math.max(to, Math.min(from, vw / 2 - (card.offsetLeft + card.offsetWidth / 2)));
          if (lastX - x < vw * 0.6) continue;
          lastX = x;
          times.push(trackAt + ((x - from) / (to - from)) * TRACK_TIME);
        }
        return times;
      };
      const stops = () =>
        [
          0,
          statementRest,
          tl.labels.about,
          ...cardStops(),
          tl.labels.drop,
          tl.labels.vault,
          tl.labels.footer,
          tl.duration(),
        ].map(toScroll);
      const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
      let moving = false;
      let release = 0;
      const go = (direction: 1 | -1) => {
        if (moving || looping || smooth.isStopped || !trigger) return;
        const y = window.scrollY;
        const points = stops().sort((a, b) => a - b);
        const next =
          direction > 0 ? points.find((point) => point > y + 8) : [...points].reverse().find((point) => point < y - 8);
        if (next === undefined) return;
        moving = true;
        const screens = Math.abs(next - y) / window.innerHeight;
        const duration = Math.min(2.4, Math.max(1.1, 0.7 + screens * 0.45));
        smooth.scrollTo(next, { duration, easing: easeInOut, lock: true, force: true });
        // Released on a timer, not onComplete: the end-of-page loop can cut the glide short,
        // and then onComplete never fires.
        window.clearTimeout(release);
        release = window.setTimeout(() => {
          moving = false;
        }, duration * 1000 + 120);
      };
      stopPaging = () => window.clearTimeout(release);
      swipes = Observer.create({
        target: window,
        type: "touch",
        tolerance: 12,
        onUp: () => go(1),
        onDown: () => go(-1),
      });
    }

    let alive = true;
    void document.fonts.ready.then(() => {
      if (alive) ScrollTrigger.refresh();
    });

    return () => {
      alive = false;
      window.removeEventListener("pointermove", onPointerMove);
      stopMesh();
      stopCursor();
      swipes?.kill();
      stopPaging();
      html.classList.remove("bbh-paged");
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      smooth.destroy();
      lenis = null;
      trigger = null;
      jump = null;
      spacer.style.removeProperty("height");
      curtain.style.removeProperty("animation");
      root.removeAttribute("data-scene-tone");
      root.removeAttribute("data-nav");
      delete root.dataset.stage;
      html.classList.remove("bbh-stage");
    };
  });

  return {
    isActive: () => lenis !== null && trigger !== null,
    setPaused(paused) {
      if (!lenis) return;
      if (paused) lenis.stop();
      else lenis.start();
    },
    scrollTo(target) {
      if (!lenis || !trigger || !jump) return;
      if (target === "top") {
        lenis.scrollTo(0, { duration: 1.8, easing: (t) => 1 - Math.pow(1 - t, 4) });
        return;
      }
      // Jump straight there while the closing menu still covers the screen.
      lenis.start();
      jump(trigger.labelToScroll(target));
    },
    destroy() {
      mm.revert();
    },
  };
}

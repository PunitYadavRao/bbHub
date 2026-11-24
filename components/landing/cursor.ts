/**
 * The landing cursor, matched to the reference site's proportions as measured with REA on a
 * Retina screen: ten 13px dots (each 5% smaller than the one before) merged by a goo filter
 * (blur 6, alpha × 35 − 15, in landing-shell.tsx). At rest the merged blob is a small dot;
 * moving, the dots spread along the path into a short teardrop, so it still reads as a dot.
 *
 * Each frame the chain is rebuilt from the pointer: every dot sits 35% of the way from the dot
 * ahead of it towards where it was last frame, which keeps the tail short. 150ms after the
 * pointer stops, all but the first three dots wobble on slow sine paths so the blob breathes.
 * The layer blends with `difference`: red over black, black over red. The native cursor is
 * hidden only while the blob is showing.
 */

/** The goo filter works inside this square, which travels with the pointer. */
const BOX = 240;
/** Dot size in px; must match `.bbh-cursor i` in landing.css. */
const DOT = 13;
const FOLLOW = 0.35;
const IDLE_MS = 150;
/** Dots that keep following (instead of wobbling) when the pointer rests. */
const STEADY = 3;
/** Wobble speed: 0.05 rad per frame at 60fps. */
const WOBBLE_SPEED = 3;

export function startCursor(root: HTMLElement, cursor: HTMLElement): () => void {
  const dots = Array.from(cursor.querySelectorAll<HTMLElement>("i"));
  if (!dots.length || !window.matchMedia("(pointer: fine)").matches) return () => {};

  const half = BOX / 2;
  const reach = half - DOT;
  const state = dots.map((_, index) => {
    const scale = 1 - 0.05 * index;
    return {
      x: 0,
      y: 0,
      scale,
      range: DOT / 2 - (DOT / 2) * scale + 2,
      lockX: 0,
      lockY: 0,
      angleX: 0,
      angleY: 0,
    };
  });

  let pointerX = 0;
  let pointerY = 0;
  let placed = false;
  let visible = false;
  let idle = false;
  let lastMove = 0;
  let lastFrame = 0;
  let frame = 0;

  const show = (on: boolean) => {
    if (on === visible) return;
    visible = on;
    cursor.toggleAttribute("data-visible", on);
    if (on) root.dataset.cursor = "on";
    else delete root.dataset.cursor;
  };

  const onPointerMove = (event: PointerEvent) => {
    if (event.pointerType !== "mouse") return;
    pointerX = event.clientX;
    pointerY = event.clientY;
    lastMove = performance.now();
    if (!placed) {
      placed = true;
      state.forEach((dot) => {
        dot.x = pointerX;
        dot.y = pointerY;
      });
    }
    show(true);
  };
  const onPointerLeave = () => show(false);

  const tick = (now: number) => {
    frame = requestAnimationFrame(tick);
    const seconds = Math.min(0.05, (now - lastFrame) / 1000);
    lastFrame = now;
    if (!placed) return;

    const resting = now - lastMove > IDLE_MS;
    if (resting && !idle) {
      // Lock the tail where it stopped, with a random phase per dot.
      state.forEach((dot) => {
        dot.lockX = dot.x;
        dot.lockY = dot.y;
        dot.angleX = Math.random() * Math.PI * 2;
        dot.angleY = Math.random() * Math.PI * 2;
      });
    }
    idle = resting;

    let x = pointerX;
    let y = pointerY;
    state.forEach((dot, index) => {
      const next = state[index + 1] ?? state[0];
      if (!idle || index <= STEADY) {
        dot.x = x;
        dot.y = y;
        x += (next.x - dot.x) * FOLLOW;
        y += (next.y - dot.y) * FOLLOW;
      } else {
        dot.angleX += WOBBLE_SPEED * seconds;
        dot.angleY += WOBBLE_SPEED * seconds;
        dot.x = dot.lockX + Math.sin(dot.angleX) * dot.range;
        dot.y = dot.lockY + Math.sin(dot.angleY) * dot.range;
      }
      // Keep every dot inside the filter square, or the goo would clip it.
      const dx = dot.x - pointerX;
      const dy = dot.y - pointerY;
      const dist = Math.hypot(dx, dy);
      if (dist > reach) {
        dot.x = pointerX + (dx / dist) * reach;
        dot.y = pointerY + (dy / dist) * reach;
      }
    });

    cursor.style.transform = `translate3d(${pointerX - half}px, ${pointerY - half}px, 0)`;
    dots.forEach((el, index) => {
      const dot = state[index];
      el.style.transform = `translate3d(${(dot.x - pointerX + half).toFixed(2)}px, ${(dot.y - pointerY + half).toFixed(2)}px, 0) scale(${dot.scale})`;
    });
  };

  window.addEventListener("pointermove", onPointerMove, { passive: true });
  document.documentElement.addEventListener("pointerleave", onPointerLeave);
  window.addEventListener("blur", onPointerLeave);
  frame = requestAnimationFrame(tick);

  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener("pointermove", onPointerMove);
    document.documentElement.removeEventListener("pointerleave", onPointerLeave);
    window.removeEventListener("blur", onPointerLeave);
    show(false);
    cursor.style.removeProperty("transform");
    dots.forEach((dot) => dot.style.removeProperty("transform"));
  };
}

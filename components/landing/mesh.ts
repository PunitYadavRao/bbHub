/**
 * The glowing triangle network behind the landing page. Points float in a 3D box that slowly
 * turns (and turns a little more as you scroll); every pair of points closer than the link
 * distance is joined, so the lines close into triangles. Near lines are thicker and brighter,
 * each with a soft glow; nodes are glowing balls (a few red); bokeh dust and two light leaks
 * drift through. CSS screens the canvas over the page and keeps the centre faint.
 *
 * `light` mode (phones and tablets) uses fewer points, a lower pixel ratio and 30fps.
 */

type Point = { x: number; y: number; z: number; vx: number; vy: number; vz: number; red: boolean };
type Mote = { x: number; y: number; vx: number; vy: number; r: number; a: number };

/** Lines are grouped by depth and by length so each group is one stroke call. */
const DEPTHS = 4;
const STRENGTHS = 3;

function glowSprite(rgb: string, size = 64): HTMLCanvasElement {
  const sprite = document.createElement("canvas");
  sprite.width = size;
  sprite.height = size;
  const g = sprite.getContext("2d");
  if (g) {
    const mid = size / 2;
    const fill = g.createRadialGradient(mid, mid, 0, mid, mid, mid);
    fill.addColorStop(0, `rgba(${rgb}, 1)`);
    fill.addColorStop(0.16, `rgba(${rgb}, 0.9)`);
    fill.addColorStop(0.42, `rgba(${rgb}, 0.2)`);
    fill.addColorStop(1, `rgba(${rgb}, 0)`);
    g.fillStyle = fill;
    g.fillRect(0, 0, size, size);
  }
  return sprite;
}

export function startMesh(canvas: HTMLCanvasElement, { light = false }: { light?: boolean } = {}): () => void {
  const context = canvas.getContext("2d");
  if (!context) return () => {};
  const ctx = context;
  const white = glowSprite("255, 255, 255");
  const red = glowSprite("232, 38, 43");

  let width = 0;
  let height = 0;
  let ratio = 1;
  let link = 300;
  let camera = 2000;
  let box = { x: 1, y: 1, z: 1 };
  let points: Point[] = [];
  let motes: Mote[] = [];
  let spin = 0;
  let leanX = 0;
  let leanY = 0;
  let aimX = 0;
  let aimY = 0;
  let frame = 0;
  let ticks = 0;

  const random = (min: number, max: number) => min + Math.random() * (max - min);

  const layout = () => {
    // Phone toolbars change the height while scrolling; only reshuffle on a real width change.
    const reshuffle = !points.length || Math.abs(window.innerWidth - width) > 40;
    ratio = Math.min(window.devicePixelRatio || 1, light ? 1.5 : 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    if (!reshuffle) return;
    box = { x: width * 0.72, y: height * 0.72, z: Math.max(width, height) * 0.45 };
    const count = light ? 34 : Math.round(Math.min(66, Math.max(40, (width * height) / 26000)));
    // Link distance chosen so each point has about 3.5 neighbours on average.
    link = Math.cbrt((3.5 * 8 * box.x * box.y * box.z) / count / 4.19);
    camera = Math.max(width, height) * 1.5;
    points = Array.from({ length: count }, (_, index) => ({
      x: random(-box.x, box.x),
      y: random(-box.y, box.y),
      z: random(-box.z, box.z),
      vx: random(-0.14, 0.14),
      vy: random(-0.12, 0.12),
      vz: random(-0.12, 0.12),
      red: index % 9 === 0,
    }));
    motes = Array.from({ length: light ? 10 : 18 }, () => ({
      x: random(0, width),
      y: random(0, height),
      vx: random(-0.08, 0.08),
      vy: random(-0.06, 0.06),
      r: random(6, 34),
      a: random(0.05, 0.16),
    }));
  };

  const draw = () => {
    frame = requestAnimationFrame(draw);
    ticks += 1;
    if (light && ticks % 2) return;
    const speed = light ? 2 : 1;

    spin += 0.0006 * speed;
    leanX += (aimX - leanX) * 0.04;
    leanY += (aimY - leanY) * 0.04;
    const yaw = spin + leanX + window.scrollY * 0.00035;
    const pitch = Math.sin(spin * 0.8) * 0.22 + leanY;
    const cy = Math.cos(yaw);
    const sy = Math.sin(yaw);
    const cp = Math.cos(pitch);
    const sp = Math.sin(pitch);

    const sx: number[] = [];
    const syv: number[] = [];
    const depth: number[] = [];
    for (const p of points) {
      p.x += p.vx * speed;
      p.y += p.vy * speed;
      p.z += p.vz * speed;
      if (Math.abs(p.x) > box.x) p.vx *= -1;
      if (Math.abs(p.y) > box.y) p.vy *= -1;
      if (Math.abs(p.z) > box.z) p.vz *= -1;
      const x1 = p.x * cy - p.z * sy;
      const z1 = p.x * sy + p.z * cy;
      const y1 = p.y * cp - z1 * sp;
      const z2 = p.y * sp + z1 * cp;
      const scale = camera / (camera + z2);
      sx.push(width / 2 + x1 * scale);
      syv.push(height / 2 + y1 * scale);
      depth.push(Math.min(1, Math.max(0, (scale - 0.72) / 0.75)));
    }

    const groups = Array.from({ length: DEPTHS * STRENGTHS }, () => new Path2D());
    for (let i = 0; i < points.length; i += 1) {
      for (let j = i + 1; j < points.length; j += 1) {
        const a = points[i];
        const b = points[j];
        const dist = Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
        if (dist > link) continue;
        const d = Math.min(DEPTHS - 1, Math.floor(((depth[i] + depth[j]) / 2) * DEPTHS));
        const s = Math.min(STRENGTHS - 1, Math.floor((1 - dist / link) * STRENGTHS));
        const path = groups[d * STRENGTHS + s];
        path.moveTo(sx[i], syv[i]);
        path.lineTo(sx[j], syv[j]);
      }
    }

    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, width, height);

    // Two soft light leaks, breathing slowly.
    const pulse = 0.5 + Math.sin(spin * 6) * 0.5;
    for (const [lx, ly, lr, la] of [
      [width * 0.12, height * 0.02, width * 0.55, 0.07 + pulse * 0.03],
      [width * 0.92, height * 0.98, width * 0.5, 0.05 + (1 - pulse) * 0.03],
    ]) {
      const leak = ctx.createRadialGradient(lx, ly, 0, lx, ly, lr);
      leak.addColorStop(0, `rgba(255, 255, 255, ${la})`);
      leak.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = leak;
      ctx.fillRect(0, 0, width, height);
    }

    for (const mote of motes) {
      mote.x += mote.vx * speed;
      mote.y += mote.vy * speed;
      if (mote.x < -40 || mote.x > width + 40) mote.vx *= -1;
      if (mote.y < -40 || mote.y > height + 40) mote.vy *= -1;
      ctx.globalAlpha = mote.a;
      ctx.drawImage(white, mote.x - mote.r, mote.y - mote.r, mote.r * 2, mote.r * 2);
    }
    ctx.globalAlpha = 1;

    ctx.lineCap = "round";
    groups.forEach((path, index) => {
      const d = Math.floor(index / STRENGTHS);
      const s = index % STRENGTHS;
      const core = 0.55 + d * 0.5;
      const alpha = (0.12 + s * 0.14) * (0.45 + d * 0.2);
      // Glow pass, then the bright core.
      ctx.lineWidth = core * 5;
      ctx.strokeStyle = `rgba(255, 255, 255, ${(alpha * 0.12).toFixed(3)})`;
      ctx.stroke(path);
      ctx.lineWidth = core;
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha.toFixed(3)})`;
      ctx.stroke(path);
    });

    points.forEach((p, i) => {
      const size = 2 + depth[i] * 6;
      ctx.globalAlpha = 0.35 + depth[i] * 0.6;
      ctx.drawImage(p.red ? red : white, sx[i] - size * 2, syv[i] - size * 2, size * 4, size * 4);
    });
    ctx.globalAlpha = 1;
  };

  const onPointerMove = (event: PointerEvent) => {
    aimX = (event.clientX / width - 0.5) * 0.25;
    aimY = (event.clientY / height - 0.5) * 0.18;
  };

  layout();
  draw();
  window.addEventListener("resize", layout);
  window.addEventListener("pointermove", onPointerMove, { passive: true });

  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener("resize", layout);
    window.removeEventListener("pointermove", onPointerMove);
    // Release the bitmap; the next start sizes it again.
    canvas.width = 0;
    canvas.height = 0;
  };
}

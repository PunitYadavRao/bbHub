/**
 * Thin line icons for the hero columns: 1px outlines at any size, with one red accent each.
 * A mix of isometric objects (projected below from simple boxes) and flat campus symbols.
 * Original artwork; strokes use currentColor, accents use the brand red.
 */

/** fill: outline over the page black (hides what's behind) · red: outline over brand red ·
 * line: outline only · redline: red outline only · dash: dashed outline. */
type Tone = "fill" | "red" | "line" | "redline" | "dash";
type Shape = { d: string; tone: Tone };
type Icon = { viewBox: string; shapes: Shape[] };

const r = (n: number) => Math.round(n * 100) / 100;

// Isometric geometry ----------------------------------------------------------------------------
// x runs down-right, y runs down-left, z runs up. Faces are painted in list order, back to front.

type V3 = [number, number, number];
type Face = { pts: V3[]; tone?: Tone; open?: boolean };

const COS30 = Math.cos(Math.PI / 6);
const project = ([x, y, z]: V3): [number, number] => [(x - y) * COS30, (x + y) / 2 - z];

/** Projects the faces and fits the viewBox around them. */
function iso(faces: Face[], pad = 1.5): Icon {
  const flat = faces.map((face) => ({ ...face, p: face.pts.map(project) }));
  const xs = flat.flatMap((face) => face.p.map(([x]) => x));
  const ys = flat.flatMap((face) => face.p.map(([, y]) => y));
  const minX = Math.min(...xs) - pad;
  const minY = Math.min(...ys) - pad;
  return {
    viewBox: `${r(minX)} ${r(minY)} ${r(Math.max(...xs) + pad - minX)} ${r(Math.max(...ys) + pad - minY)}`,
    shapes: flat.map((face) => ({
      d: `M${face.p.map(([x, y]) => `${r(x)} ${r(y)}`).join("L")}${face.open ? "" : "Z"}`,
      tone: face.tone ?? (face.open ? "line" : "fill"),
    })),
  };
}

/** The three visible faces of a box at (x, y, z) sized (w, d, h): right (+x), left (+y), top. */
function box(
  x: number,
  y: number,
  z: number,
  w: number,
  d: number,
  h: number,
  tones: { top?: Tone; left?: Tone; right?: Tone } = {},
): Face[] {
  return [
    { pts: [[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]], tone: tones.right },
    { pts: [[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]], tone: tones.left },
    { pts: [[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]], tone: tones.top },
  ];
}

const seg = (a: V3, b: V3, tone: Tone = "line"): Face => ({ pts: [a, b], open: true, tone });

/** A rectangle drawn on a left-facing (+y) wall at depth y. */
const onLeft = (y: number, x0: number, z0: number, x1: number, z1: number, tone: Tone = "line"): Face => ({
  pts: [[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]],
  tone,
});

/** A rectangle drawn on a right-facing (+x) wall at x. */
const onRight = (x: number, y0: number, z0: number, y1: number, z1: number, tone: Tone = "line"): Face => ({
  pts: [[x, y0, z0], [x, y1, z0], [x, y1, z1], [x, y0, z1]],
  tone,
});

/** A rectangle lying on a surface at height z. */
const onTop = (z: number, x0: number, y0: number, x1: number, y1: number, tone: Tone = "line"): Face => ({
  pts: [[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z]],
  tone,
});

// Flat helpers ----------------------------------------------------------------------------------

const circle = (cx: number, cy: number, rad: number) =>
  `M${r(cx - rad)} ${cy}a${rad} ${rad} 0 1 0 ${r(2 * rad)} 0a${rad} ${rad} 0 1 0 ${r(-2 * rad)} 0Z`;

const flat = (viewBox: string, shapes: [Tone, string][]): Icon => ({
  viewBox,
  shapes: shapes.map(([tone, d]) => ({ tone, d })),
});

const ICONS = {
  // Isometric objects ---------------------------------------------------------------------------
  desk: iso([
    seg([1, 11, 0], [1, 11, 12]),
    seg([19, 1, 0], [19, 1, 12]),
    seg([19, 11, 0], [19, 11, 12]),
    ...box(0, 0, 12, 20, 12, 1.6),
    ...box(4, 3, 13.6, 8, 5.5, 1.3, { top: "red" }),
    seg([14.5, 3.5, 13.6], [17.5, 8, 13.6]),
  ]),
  books: iso([
    ...box(0, 0, 0, 14, 10, 3),
    seg([14, 1, 1.5], [14, 9, 1.5]),
    ...box(1.5, 0.5, 3, 12, 9, 2.6, { left: "red" }),
    ...box(0.5, 1, 5.6, 13, 9.5, 2.4),
    seg([13.5, 2, 6.8], [13.5, 9.5, 6.8]),
  ]),
  laptop: iso([
    ...box(0, 0, 1.2, 16, 0.9, 11),
    onLeft(0.9, 2, 6.4, 8, 10.4, "red"),
    seg([9.5, 0.9, 9.6], [14, 0.9, 9.6]),
    seg([9.5, 0.9, 8], [13, 0.9, 8]),
    seg([2, 0.9, 4.6], [14, 0.9, 4.6]),
    ...box(0, 0.9, 0, 16, 11, 1.2),
    seg([2.5, 3.6, 1.2], [13.5, 3.6, 1.2]),
    seg([2.5, 5.4, 1.2], [13.5, 5.4, 1.2]),
    onTop(1.2, 6, 7.8, 10, 10.6),
  ]),
  hostel: iso([
    ...box(0, 0, 0, 12, 10, 19),
    ...[4, 9, 14].flatMap((z, row) =>
      [2, 7].map((x, col) => onLeft(10, x, z, x + 3, z + 3, row === 1 && col === 0 ? "red" : "line")),
    ),
    ...[4, 9, 14].flatMap((z) => [2, 6].map((y) => onRight(12, y, z, y + 2.5, z + 3))),
    ...box(-0.6, -0.6, 19, 13.2, 11.2, 1.2),
  ]),
  bench: iso([
    seg([1, 5.5, 0], [1, 5.5, 5]),
    seg([23, 0.6, 0], [23, 0.6, 5]),
    seg([23, 5.5, 0], [23, 5.5, 5]),
    ...box(0, 0, 5, 24, 1, 8),
    seg([0.8, 1, 8.6], [23.2, 1, 8.6]),
    seg([0.8, 1, 11], [23.2, 1, 11]),
    ...box(0, 1, 5, 24, 5, 1.2, { left: "red" }),
  ]),
  tiles: iso(
    [0, 1, 2]
      .flatMap((i) => [0, 1, 2].map((j) => ({ i, j })))
      .sort((a, b) => a.i + a.j - (b.i + b.j))
      .flatMap(({ i, j }) => box(i * 5, j * 5, 0, 4, 4, 1.4, { top: (i * 3 + j) % 4 === 1 ? "red" : undefined })),
  ),
  // An isometric AI chip: pins on the two visible sides, "AI" in red on the lid.
  ai: iso([
    ...[3, 7, 11].map((t) => seg([14, t, 0.7], [16.6, t, 0.7])),
    ...[3, 7, 11].map((t) => seg([t, 14, 0.7], [t, 16.6, 0.7])),
    ...box(0, 0, 0, 14, 14, 2.2),
    onTop(2.2, 2, 2, 12, 12),
    seg([3.2, 9.6, 2.2], [5.2, 4.4, 2.2], "redline"),
    seg([5.2, 4.4, 2.2], [7.2, 9.6, 2.2], "redline"),
    seg([4, 7.6, 2.2], [6.4, 7.6, 2.2], "redline"),
    seg([10, 4.4, 2.2], [10, 9.6, 2.2], "redline"),
    seg([9, 4.4, 2.2], [11, 4.4, 2.2], "redline"),
    seg([9, 9.6, 2.2], [11, 9.6, 2.2], "redline"),
  ]),
  cube: iso(box(0, 0, 0, 7, 7, 7)),
  cubeRed: iso(box(0, 0, 0, 7, 7, 7, { top: "red" })),
  pyramid: iso([
    { pts: [[8, 0, 0], [8, 8, 0], [4, 4, 10]] },
    { pts: [[0, 8, 0], [8, 8, 0], [4, 4, 10]], tone: "red" },
  ]),

  // Flat symbols (32 × 32) -------------------------------------------------------------------------
  bulb: flat("0 0 32 32", [
    ["line", "M16 1.2V2.8M5.4 5.4l1.1 1.1M26.6 5.4l-1.1 1.1M2.2 12h1.6M28.2 12h1.6"],
    [
      "fill",
      "M16 4.6c-4.4 0-7.5 3.3-7.5 7.3 0 2.8 1.5 4.6 3 6 .9.9 1.3 1.8 1.3 3h6.4c0-1.2.4-2.1 1.3-3 1.5-1.4 3-3.2 3-6 0-4-3.1-7.3-7.5-7.3Z",
    ],
    ["redline", "M13.4 12.6l1.6 2 1-2 1 2 1.6-2"],
    ["fill", "M12.8 20.9h6.4v2.2h-6.4ZM13.7 23.1h4.6v2h-4.6Z"],
  ]),
  chat: flat("0 0 32 32", [
    ["fill", "M13 7h14a1.5 1.5 0 0 1 1.5 1.5v8A1.5 1.5 0 0 1 27 18h-2v3l-3.2-3H13a1.5 1.5 0 0 1-1.5-1.5v-8A1.5 1.5 0 0 1 13 7Z"],
    ["fill", "M5 12h14a1.5 1.5 0 0 1 1.5 1.5v8A1.5 1.5 0 0 1 19 23h-8.8L7 26v-3H5a1.5 1.5 0 0 1-1.5-1.5v-8A1.5 1.5 0 0 1 5 12Z"],
    ["red", `${circle(8.5, 17.5, 1)}${circle(12, 17.5, 1)}${circle(15.5, 17.5, 1)}`],
  ]),
  crown: flat("0 0 32 32", [
    ["fill", "M6 22 4.5 10.5 11 15.5 16 7.5l5 8 6.5-5L26 22Z"],
    ["fill", "M6 22h20v3.4H6Z"],
    ["red", circle(16, 18.4, 1.6)],
    ["fill", `${circle(4.5, 10.5, 1)}${circle(16, 7.5, 1)}${circle(27.5, 10.5, 1)}`],
  ]),
  trophy: flat("0 0 32 32", [
    ["line", "M10 8H7c0 4 1.5 5.6 3.5 6M22 8h3c0 4-1.5 5.6-3.5 6M16 20v4"],
    ["fill", "M10 6h12v7c0 4.4-2.7 7-6 7s-6-2.6-6-7Z"],
    ["red", "M16 9.2l.7 1.9 2 .1-1.6 1.2.6 1.9-1.7-1.1-1.7 1.1.6-1.9-1.6-1.2 2-.1Z"],
    ["fill", "M11.5 24.4h9v2.8h-9Z"],
  ]),
  lock: flat("0 0 32 32", [
    ["line", "M11 14v-3.5c0-3 2.2-5 5-5s5 2 5 5V14"],
    ["fill", "M9.5 14h13a1 1 0 0 1 1 1v10.5a1 1 0 0 1-1 1h-13a1 1 0 0 1-1-1V15a1 1 0 0 1 1-1Z"],
    ["red", "M16 17.4a1.8 1.8 0 0 1 1 3.3V23h-2v-2.3a1.8 1.8 0 0 1 1-3.3Z"],
  ]),
  mask: flat("0 0 32 32", [
    ["line", "M4 13 1.5 11.4M28 13l2.5-1.6"],
    [
      "fill",
      "M4 13c0-2.5 2-3.5 5-3.5s5 1.5 7 1.5 4-1.5 7-1.5 5 1 5 3.5c0 4.5-2.5 8-6 8-3 0-4-2.5-6-2.5s-3 2.5-6 2.5c-3.5 0-6-3.5-6-8Z",
    ],
    ["red", "M8 14.5c1-1.5 3.5-1.5 4.5 0-1 1.1-3.5 1.1-4.5 0ZM19.5 14.5c1-1.5 3.5-1.5 4.5 0-1 1.1-3.5 1.1-4.5 0Z"],
  ]),
  bell: flat("0 0 32 32", [
    ["line", "M16 5V3.4M13.5 21c0 1.6 1.1 2.8 2.5 2.8s2.5-1.2 2.5-2.8"],
    ["fill", "M16 5c-4.2 0-6.5 3.3-6.5 7.5V17L7 21h18l-2.5-4v-4.5C22.5 8.3 20.2 5 16 5Z"],
    ["red", circle(23, 7.2, 2.6)],
  ]),
  clock: flat("0 0 32 32", [
    ["line", "M8.6 8.8a3.2 3.2 0 0 1 3.6-2.6M23.4 8.8a3.2 3.2 0 0 0-3.6-2.6M10.5 24.5 9 27M21.5 24.5 23 27"],
    ["fill", circle(16, 17, 9)],
    ["redline", "M16 17h-5M16 17v-6.2"],
    ["red", circle(16, 17, 1)],
  ]),
  plane: flat("0 0 32 32", [
    ["dash", "M2 25c3-2 5.5-.5 8.5-3.5"],
    ["fill", "M4 15.5 28 6l-7 20-5.5-7Z"],
    ["red", "M15.5 19 28 6l-13.4 8.4Z"],
    ["line", "M15.5 19l-1 6 3.6-3"],
  ]),
  pencil: flat("0 0 32 32", [
    ["fill", "M6.2 22.2 22.2 6.2l3.6 3.6-16 16Z"],
    ["fill", "M6.2 22.2l-2.1 5.7 5.7-2.1Z"],
    ["red", "M4.1 27.9l.6-1.7 1.1 1.1Z"],
    ["red", "M22.2 6.2l3.6 3.6-3.2 3.2-3.6-3.6Z"],
  ]),
  gamepad: flat("0 0 32 32", [
    [
      "fill",
      "M9 11h14c3.5 0 5.5 3 6 7 .4 3.5-1 6-3 6-1.7 0-2.7-1.4-4-3H10c-1.3 1.6-2.3 3-4 3-2 0-3.4-2.5-3-6 .5-4 2.5-7 6-7Z",
    ],
    ["line", "M8 15.4v4.2M5.9 17.5h4.2"],
    ["red", circle(22, 15.8, 1.2)],
    ["fill", circle(24.6, 18.6, 1.2)],
  ]),
  headphones: flat("0 0 32 32", [
    ["line", "M6 19v-3c0-6 4.5-10 10-10s10 4 10 10v3"],
    ["fill", "M4.5 18H9v8H4.5a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1Z"],
    ["red", "M23 18h4.5a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H23Z"],
  ]),
  cup: flat("0 0 32 32", [
    ["redline", "M12.5 9.5c-1-1.5 1-2.5 0-4.5M16.5 9.5c-1-1.5 1-2.5 0-4.5"],
    ["line", "M22 14.5h2a3 3 0 0 1 0 6h-2"],
    ["fill", "M8 12h14v9a6 6 0 0 1-6 6h-2a6 6 0 0 1-6-6Z"],
  ]),
  megaphone: flat("0 0 32 32", [
    ["line", "M9 19.5l1.5 5.5h3l-1.3-4.4"],
    ["fill", "M6 13l16-7v20L6 19Z"],
    ["fill", "M3.5 13H6v6H3.5Z"],
    ["redline", "M25 12.5c1.5 2 1.5 5 0 7M27.8 10c2.7 3.5 2.7 8.5 0 12"],
  ]),

  // The BBHub mascot: a robot in a suit straightening its tie, inside a round badge (40 × 40).
  mascot: flat("0 0 40 40", [
    ["line", circle(20, 21.5, 17.5)],
    ["line", "M18.6 19v3.4M22.4 19v3.4"],
    [
      "fill",
      "M7 33.5c.6-6 3.6-8.6 8.6-10.1L20 22.6l4.4.8c5 1.5 8 4.1 8.6 10.1-3.9 3.6-8.4 5.2-13 5.2s-9.1-1.6-13-5.2Z",
    ],
    ["line", "M15.6 23.4 19.3 32M24.4 23.4 20.7 32M16.8 23.2 20 29.4l3.2-6.2"],
    ["red", "M19.1 23.8h1.8l.7 1.4-.9 5.8-.7 1.2-.7-1.2-.9-5.8Z"],
    ["line", "M26.6 29.4h3l-.7-1.4"],
    ["line", "M17 28.6c-2.4 1.4-4.2 3.4-5.3 6.2"],
    [
      "fill",
      "M16.8 28.2c0-1.5 1.5-2.2 2.6-1.7l2.4.9c1 .4.8 1.8-.3 1.8h-3.2c-.9 0-1.5-.4-1.5-1Z",
    ],
    [
      "fill",
      "M14 14.6C14 8 17 4.6 21 4.6c4.5 0 6.6 3.5 6.6 8.4v3c0 2-1.5 3-3.5 3h-7c-2 0-3.1-1.6-3.1-3.6Z",
    ],
    ["line", "M15.4 13.4c2.6-1.6 6.6-1.7 10.7-.6"],
    ["fill", circle(27.6, 12.6, 2.6)],
    ["red", circle(27.6, 12.6, 1)],
  ]),

  // Small fillers ----------------------------------------------------------------------------------
  plus: flat("0 0 10 10", [["line", "M5 1v8M1 5h8"]]),
  arrow: flat("0 0 20 12", [["line", "M1 1l17 9.5M13.6 10.6l4.4-.1-2-3.9"]]),
  bars: flat("0 0 16 12", [
    ["line", "M1.5 11V8M4.5 11V5M7.5 11V7M13.5 11V6"],
    ["redline", "M10.5 11V2.5"],
  ]),
  dot: flat("0 0 6 6", [["red", circle(3, 3, 2.2)]]),
  ring: flat("0 0 10 10", [["line", circle(5, 5, 3.6)]]),
  spark: flat("0 0 14 14", [["fill", "M7 1c.6 4.2 1.8 5.4 6 6-4.2.6-5.4 1.8-6 6-.6-4.2-1.8-5.4-6-6 4.2-.6 5.4-1.8 6-6Z"]]),
  tri: flat("0 0 12 11", [["line", "M6 1l5 9H1Z"]]),
  wifi: flat("0 0 16 14", [
    ["line", "M2 6c4-3.5 8-3.5 12 0M4.5 8.6c2.5-2 4.5-2 7 0"],
    ["red", circle(8, 11.5, 1.1)],
  ]),
} satisfies Record<string, Icon>;

export type LineIconName = keyof typeof ICONS;

export function LineIcon({ name, className }: { name: LineIconName; className?: string }) {
  const icon: Icon = ICONS[name];
  return (
    <svg
      viewBox={icon.viewBox}
      className={className ? `bbh-icon ${className}` : "bbh-icon"}
      aria-hidden="true"
      focusable="false"
    >
      {icon.shapes.map((shape, index) => (
        <path key={index} d={shape.d} className={`bbh-icon__${shape.tone}`} />
      ))}
    </svg>
  );
}

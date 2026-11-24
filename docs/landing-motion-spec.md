# Landing page motion spec

How BBHub's landing page moves, and where each idea came from. The reference was
<https://en.college.icds.ai/>, observed with REA (Reverse Engineer Anything). REA drove headless
Chromium 151 at 1440×900, 1280×800 and 390×844, with `prefers-reduced-motion: no-preference`.

**Clean-room.** Only behaviour was observed: pacing, timings, easing curves, transform and opacity
mechanics, and layout switching. No markup, CSS, scripts, images, fonts or branding from the
reference are used. BBHub's code, copy, pixel icons and colours are original.

**Legend.** *Observed*: seen in screenshots, the DOM or the stylesheet. *Inferred*: estimated from
frame timing. The reference's main timeline script was not captured, so all scroll-tween timings
are inferred.

## 1. Architecture (observed)

- Barba.js handles page transitions. On desktop every scene is a full-viewport `position: fixed`
  layer.
- Page height comes from 16 empty spacer blocks, 100–500vh each, about 39 viewports in total.
- Scroll position drives every scene, and scrolling up plays it backwards, so the tweens are
  scrubbed rather than one-shot.
- GSAP writes the inline transforms. The cursor and the Lottie loader are separate bundles.
- A progress rail sits at the left: a 12px track with an 8px dot. The dot moves in 0.2s with
  `cubic-bezier(.16,.59,.8,.99)`.
- A film-grain video overlay covers the page at 50% opacity (30% on phones).

## 2. Load sequence (frames at 0.6s, 1.8s and 4.0s)

1. A theme-colour curtain fills the screen, with the logo inside a thin progress ring.
2. The curtain clears into the hero.
3. The title builds letter by letter. Each letter has coloured echo copies about 100px above it
   inside a clipped box: the echo surfaces first, then the dark letter rises over it. The stagger
   is about 80–120ms per letter (inferred).
4. The sub-title pill gets three stacked background layers, which slide in from the right one
   after another. Then its label slides in.
5. The side illustration columns fade in from `opacity 0, scale 1.2` and drift about 30px inward.
6. The round menu button scales from 0 to 1. A "scroll down" line loops every 2s, moving from
   −2rem to +2rem while its opacity goes 0 → 1 → 0.

## 3. Scroll rhythm (24 × PageDown at 1280×800)

| Steps | What happens |
|---|---|
| 0–2 | The hero letters drop out. A two-line statement rises through clips; line 2 is larger and in the theme colour. |
| 3–4 | **Bar wipe**: 9 vertical bars about 11vw wide rise from below. They are 100–140vh tall, so their tops form a stepped pyramid. Each bar has a translucent ghost layer that leads and a solid layer that follows. |
| 5–8 | A theme-colour scene: the "What's this place?" title and paragraph rise through clips. |
| 8–9 | A wipe with the inverted profile (edges tallest) into a dark scene. |
| 9–11 | A two-tone title sits centred, then shrinks and docks at the top while a panel rises from the bottom to about 75vh. |
| 12–16 | Six cards slide right to left inside the panel, with vertical scroll driving `translateX`. The track starts at `left: 100%`. |
| 17 | A staircase wipe, heights 100→140vh from left to right. |
| 17–22 | A big title. A wide-tracked lowercase slogan starts about 50vh lower, then rises and shrinks to sit under the title. A paragraph fades in, then a pill CTA. |
| 22–23 | A mirrored staircase wipe into a second spotlight, then a last wipe into the footer. |

- Inferred: each wipe takes about one viewport of scroll. Holds between beats take 1–2 viewports.
  Scrub smoothing is about 0.5–1s.
- Observed: the reference gives every wipe its own colour (theme, charcoal, yellow, indigo,
  white). **BBHub uses one red for all of them.**

## 4. Hover-flip and micro-interactions (observed, from the CSS)

- **CTA pill.** The pill has `overflow: hidden`. A fill layer waits below (`top: 100%`) and rises
  in **0.35s `cubic-bezier(.55,0,.09,.99)`**. A second label starts below the pill and rises to
  centre in **0.45s on the same curve**. The horizontal padding tightens slightly.
- **Default UI curve.** 0.25s `cubic-bezier(.38,.01,.25,.98)`, used for the menu button growing
  from 6 to 7rem, card hover and tag pills.
- **Menu button.** A circle with three lines (50%, 100%, 50%). On hover the two short lines swap
  sides.
- **Menu links.** Each link has a ghost and a real text layer, and the real layer rises in on open.
  On hover the letter-spacing widens from 0.25 to 0.75rem and the colour changes (0.3s).
- **Cursor.** About 10 trailing dots with an SVG goo filter and `mix-blend-mode: difference`.

## 5. Card showcase (observed)

- Six cards, about 26vw wide, radius 40px, with a 1px border on white. Each has an image, a bold
  centred title and three tag pills: one solid and two outlined, uppercase and tracked.
- On hover the card fills with the theme colour, the title turns white, the solid pill darkens and
  the outlined pills invert (0.25s).
- There's no per-card stagger; the whole track moves with the scroll.

## 6. Full-screen menu (frames at click +150, 400, 800 and 1600ms)

- **Opening:** a column about 2rem wide with a rounded bottom drops from the button to full height
  (0–400ms), with a translucent ghost column leading. It then widens to fill the screen
  (400–800ms). The links rise one by one (about 600–1400ms), and the credits come last.
- **Closing:** the links slide out, the background collapses back to the column, and the column
  retracts upward. The whole close takes about 1.2s.

## 7. Desktop vs phone (observed)

- At `max-width: 1023px` the fixed stage, spacers, side art and scroll cue are all
  `display: none`.
- In their place, a separate static stack shows oversized type to the edges and solid colour blocks
  per section. The cards are stacked, scrolling is native and nothing is scroll-driven.

## 8. What BBHub built

- **One red.** `#E8262B`, the BB tile colour, is used for:
  - the load curtain and all five bar wipes
  - the menu drop and the page transition to `/join` (`components/page-transition.tsx`)
  - the progress dot, CTA fills and card hover

  Translucent layers are the same red at 40% opacity.
- **Scenes** (`components/landing/scenes.tsx`), in order:
  1. Hero: the BBHUB echo watermark, then a per-letter rise with a red echo.
  2. Statement: "what's actually happening / on campus."
  3. What's this place?, on red.
  4. Inside the Bench: the horizontal card track.
  5. 9 PM Daily Drop, on red: "from zero to crown" and an IST countdown.
  6. Two-Vault Anonymity.
  7. Footer.
- **Wipes** (`components/landing/landing-shell.tsx`): the profiles are pyramid, valley, staircase
  rising, staircase falling, then pyramid. Into a red scene the bars rise and become its
  background. Out of a red scene they lift away to reveal black.
- **Desktop** (`components/landing/motion.ts`) runs when the viewport is `min-width: 1024px` with
  `prefers-reduced-motion: no-preference`, set up through `gsap.matchMedia()`. It includes:
  - Lenis smooth scroll on GSAP's ticker
  - one master timeline scrubbed by ScrollTrigger (`scrub: 0.6`)
  - 62vh of scroll per timeline second, about 13 viewports in total
  - pointer parallax on the watermark and side glyphs
  - a dot trail for fine pointers
  - menu jumps that use `labelToScroll`
- **Cleanup:** leaving the query or unmounting the page reverts every tween, ScrollTrigger and
  inline style, and destroys Lenis.
- **Phones, tablets and reduced motion:** the static stacked layout with native scroll. GSAP and
  Lenis are never downloaded (dynamic `import()`).
- **Easing:**
  - UI: 0.25s `cubic-bezier(.38,.01,.25,.98)`
  - Flip labels: 0.45s, and fills 0.35s, `cubic-bezier(.55,0,.09,.99)`
  - Wipes and menu: `power2.inOut`, `cubic-bezier(.65,0,.35,1)`
  - Reveals: `power3.out`

# BBHub landing: handoff for a new chat

Last updated 2026-11-25. Start a new chat with: "Read docs/handoff.md and docs/landing-motion-spec.md, then continue."

## Rules from the owner (follow these first)

- **Never** add a `Co-Authored-By` line (or any AI attribution) to commits. Commit and push only when asked.
- When asked to commit: stage the code, **not** `CleanShot 2026-11-25 at 12.13.19 AM.mp4` (screen recording in the repo root) and never `.env.local` or other secrets. Don't print secret values.
- Make only the changes that were asked for. Don't resize or restyle anything else (the owner was unhappy when the tagline size was changed unasked).
- Brand: one red `#E8262B` (`var(--brand)`) everywhere, transitions included. Pure black background. Pixelify wordmark with the two capital B's in red. Tagline exactly: `We’ve got your back , you’ve got the bench.`
- Look and feel: match https://en.college.icds.ai/ in feel (small airy type, small line icons, triangle mesh, blob cursor, red bar wipes), built clean-room: no copied code, images, video or text.

## Stack

Next.js 16.4.6 (App Router, `cacheComponents`, `partialPrefetching`, `reactCompiler`), React 19.3, Tailwind v4, GSAP 3.15.1 with ScrollTrigger, Lenis 1.3.28, Google sign-in (`app/api/auth/[...all]`). `npm run dev` serves port 3000. `npm run build` must pass.

Important Next 16 behaviour: when you navigate away, the previous page is kept alive but hidden (React `<Activity>`, `display: none`). Effects clean up on hide and run again on show, with DOM and state preserved. This caused the red-screen bug (see below).

## Files

| File | What it does |
| --- | --- |
| `app/page.tsx` | Landing: `<LandingShell authSlot={…}><Scenes /></LandingShell>` |
| `app/layout.tsx` | Wraps the app in `<PageTransition>` |
| `app/grievance/page.tsx` | Placeholder grievance page (needs the real officer's details) |
| `app/globals.css` | Theme tokens and the site-wide `.page-wipe` route transition (9 red bars, loading "BB" tile while waiting) |
| `components/page-transition.tsx` | `PageTransition` (idle → cover → wait → reveal) and `TransitionLink` (plays the wipe for internal left-clicks) |
| `components/auth-buttons.tsx` | `LoginButton` / `NavAuthButton` (use `TransitionLink`, `data-nav-cta`) |
| `components/landing/stage.ts` | `STAGE_QUERY`: desktop ≥1024px and no reduced motion. Only then does the animated stage run |
| `components/landing/content.ts` | All copy: intro lines, 6 feature cards, drop and vault lines, menu links |
| `components/landing/scenes.tsx` | Server markup: Hero, Statement, Intro, Inside (cards), Drop, Vault, Footer. Hero icon layout = `LEFT_ICONS` / `RIGHT_ICONS` |
| `components/landing/landing-shell.tsx` | Client shell: header, menu, load curtain, wipes w1–w5, mesh canvas, rail, goo filter and cursor dots. Lazy-loads `motion.ts` |
| `components/landing/motion.ts` | The desktop stage: Lenis, the ScrollTrigger-scrubbed master timeline, intro, pointer parallax; starts the mesh and cursor |
| `components/landing/mesh.ts` | Drifting triangle mesh on a canvas (nodes, hairlines, faint facets, soft lights, a few red nodes) |
| `components/landing/cursor.ts` | Blob cursor: 10 red dots, goo filter, `mix-blend-mode: difference`, idle wobble, swells over links |
| `components/landing/line-icons.tsx` | Original thin line icons (isometric desk, books, laptop, hostel, bench, Wordle tiles, cubes, pyramid; flat bulb, chat, crown, trophy, lock, mask, bell, clock, plane, pencil, gamepad, headphones, cup, megaphone; small fillers) |
| `components/landing/pixel-glyph.tsx` | Older pixel-art glyphs, still used on feature cards, vault boxes and the side glyphs of later scenes |
| `components/landing/site-menu.tsx`, `flip-button.tsx`, `countdown.tsx` | Full-screen menu, flip-label buttons, 9 PM IST countdown |
| `components/landing/landing.css` | All landing styles. Static layout first; `.bbh-landing[data-stage="on"]` rules turn on the stage |
| `docs/landing-motion-spec.md` | What REA observed on the reference site and how BBHub maps to it |

## What REA found on the reference site (en.college.icds.ai)

- **Stack:** Barba.js page transitions, GSAP, Lottie, a webpack `cursor.js`. Desktop sections are fixed layers driven by scroll; mobile (≤1023px) is a plain stacked page.
- **Type scale:**
  - `html { font-size: 8px }`, but 6px on screens with device pixel ratio ≥1.25 and **4px at ≥1.5 (every Retina Mac)**. That is why it looks so small on the owner's MacBook (1512×982 CSS px at 2×).
  - Sizes in rem:
    - hero logo 18.5rem (13rem at ≤1440px); "College" pill 10rem (6rem)
    - statement 8rem and 10rem
    - section titles 6rem; big titles 12–13.25rem
    - paragraph 2.25rem with a 3rem line height (2rem at ≤1200px); "scroll down" 2rem, lowercase, #A4A4A4
    - card titles 3rem; tags 1.5rem uppercase pills
    - footer 2rem and 1.625rem
    - menu links 7rem; menu close button a 6rem circle
- **Hero icons:** `.oneVecsL/.oneVecsR`, background-image columns 415px wide and 200vh tall at 50–60% background size. Thin isometric line art with one green accent, repeating down each side.
- **Triangle mesh:** `.noise`, a fixed full-screen looping video (`transitions/noise.webm`) at z-index 10000, opacity 0.5, `mix-blend-mode: luminosity`. A radial mask keeps the centre almost clear (0.13).
- **Cursor:**
  - Structure: `#cursor.Cursor` holds 10 spans, each 3.25rem, white, scaled `1 − 0.05·i`.
  - Follow: each frame the chain moves 35% of the way towards the next dot. 150ms after the mouse stops, the tail dots wobble on sines.
  - Goo filter: `filter: url(#goo)`, built from feGaussianBlur 6, feColorMatrix alpha `35 −15`, then feComposite atop.
  - Colour: `mix-blend-mode: difference`, so the blob's colour changes over every section. `* { cursor: none !important }` hides the system cursor.
- Raw captures were saved to the scratchpad of the old chat (temporary, may be gone): `rea/net/*_style.css`, `_res.css`, `_cursor.js`, `outline_desktop.txt`, screenshots.

## Red-screen bug (fixed, keep it fixed)

- **Symptom:** after visiting another page and coming back (browser back, logo link or a menu link), scrolling to the top showed a solid red screen.
- **Cause:** Next 16 hides the landing (`display: none`) before effect cleanup. `gsap.matchMedia().revert()` then left `translate(0px, 0px)` on a wipe bar, so the bar stayed in its covering position. When the timeline ran again, its `fromTo` steps restored that state when scrolling back past them.
- **Fix in `motion.ts`:**
  - an explicit `gsap.set` starting state for every animated property each time the stage starts
  - a deterministic timeline (`fromTo` with `immediateRender: false` and `lazy: false`)
  - the stage always starts at scroll 0 under the curtain
- **Other parts of the fix:**
  - `landing-shell.tsx` closes the menu when the page is hidden
  - the route wipe shows a loading tile if the next page is slow
- **Rule:** any new animated property in `motion.ts` needs an entry in the starting-state `gsap.set` block and a `fromTo` in the timeline. Anything animated outside GSAP (mesh, cursor) must reset its inline styles in its stop function.

## Changes from the latest request (small type, icons, mesh, cursor)

- **Type scale** (`landing.css`, plus the tagline classes in `scenes.tsx`), all much smaller:
  - hero title max 3.6rem (was 7.25rem); watermark max 13rem (was 30rem)
  - section titles about 2.9–4.6rem max; body 0.9–1.05rem
  - cards: title 1rem, text 0.78rem, tags 0.6rem; buttons 0.78rem
  - header: logo 1.65rem tile with 0.88–1rem word, menu button 2.15rem, Log in 0.74rem
  - menu links max 3.1rem; footer 0.64–0.74rem
  - "scroll down" is lowercase
- **Hero icons:** the 12 chunky pixel glyphs became 40 small line icons (20 per side, 5–44px) in staggered columns 30vw wide. Lines are `#7a7a82`, accents red, with pointer parallax by depth.
- **Mesh:** `mesh.ts` and `.bbh-mesh`: a fixed canvas, z-index 45 (over scenes and wipes, under the rail, menu, header and cursor). It uses `screen` blend at 0.72 opacity with a radial mask that keeps the centre faint, and runs only while the stage is on.
- **Cursor:** `cursor.ts` and `.bbh-cursor`: 18px red dots in a 320px box that follows the pointer (the filter only works inside it). Over black it's red, over red it's black; over white text the overlap shows teal. The system cursor is hidden only while the blob shows.

## Glowing mesh, background logos and phone mode (second request on 2026-11-25)

- **REA:** the reference's triangle background is a looping video, `transitions/noise.webm`, served as media with 206 responses. Its look: a slowly turning 3D network, thicker and brighter near lines, glowing nodes, bokeh dust. That video is the reference's own asset, so it is **not** used. `mesh.ts` recreates the look in canvas:
  - points in a rotating 3D box; turns with scroll and leans with the mouse
  - near/far line widths with a glow pass, glow-sprite nodes (some red)
  - bokeh motes and two breathing light leaks
  - opacity 0.95 on black scenes and 0.5 over red (`data-scene-tone="red"`)
- **Background logos:** `EdgeIcons` in `scenes.tsx`. Each black scene (statement, Inside the Bench, vault, footer) has 5 line icons, always including the new isometric `ai` chip, plus tiny fillers. They float gently (CSS `translate` keyframes). They replaced the vault's pixel side glyphs.
- **Phones and tablets** (`lite.ts`, loaded by `landing-shell.tsx` when `STAGE_QUERY` doesn't match and motion is allowed):
  - the light mesh, scroll reveals (`data-reveal="on"`, `data-rv`, `data-in`) and a letter-by-letter hero title
  - hero icons shown, with the middle band (`.bbh-col__glyph--mid`) hidden
  - cards become a horizontal swipe carousel with a "swipe →" hint
  - Reduced motion gets the plain static page.

## Cursor, navbar, menu theme, end loop (third request on 2026-11-25)

- **Cursor** (`cursor.ts`): REA showed the reference's `cursor.js` algorithm and its look on a Retina screen (a tiny dot at rest, a small teardrop when moving). It is matched exactly:
  - 10 dots, 13px each, scaled `1 − 0.05·i`
  - the chain follow factor is 0.35
  - after 150ms idle, the dots past the first three wobble with range `w/2 − w/2·scale + 2`
  - goo filter: blur 6, alpha `35 −15`
  - no hover swell
- **Navbar:** `data-nav="full" | "center"` on `.bbh-landing`.
  - Desktop: a `nav()` flip at 0.3s in the motion timeline.
  - Phones: an IntersectionObserver on the hero in `lite.ts`.
  - When centred, the logo and Log in leave completely and the menu button glides to the top centre via `translate: calc(var(--nav-pad) + 1.075rem - 50vw)`.
- **Menu theme:** `data-menu-open` holds the theme chosen when the menu opens. It's `red` over dark scenes and `ink` (black layers, red hover text) over red scenes. On phones, `lite.ts` tracks the tone of the scene under the navbar. Header tone rules use `[data-scene-tone="red"]:not([data-menu-open])` or `[data-menu-open="red"]`.
- **End loop**, like the reference's `scripts.js`, which runs its last wipe then `scrollTo(0, 0)` and replays the intro:
  - A sixth wipe, `w6`, covers the page after the footer.
  - When the timeline reaches 0.999, `motion.ts` stops Lenis, shows the red curtain, `jumpTo(0)` and replays the intro (`playIntro(false)`), then starts Lenis again.
- **Removed:** the stacked BBHUB watermark behind the hero title.
- **Test notes:**
  - `sweep.mjs` stops at 95% of the page, before the loop.
  - It scrolls to the top before clicking Log in, because Log in hides past the hero.

## Mascot, cards and the stray BB (fourth request on 2026-11-25)

- **Stray "BB":** it showed at the top-left on the dev server because `.page-wipe__mark` was in the DOM permanently and its CSS hadn't applied there. `page-transition.tsx` now renders it only while `phase === "wait"`, with a CSS fade-in keyframe.
- **Mascot:** a `mascot` line icon in `line-icons.tsx` (robot in a suit straightening a red tie, inside a round badge). It sits in both hero columns and in every black scene's `EdgeIcons`.
- **Feature cards** (`FeatureCard` in `scenes.tsx`, `.bbh-card*` in `landing.css`):
  - dark glass card with a gradient hairline border (`::before` mask) that glows red under the pointer
  - pointer spotlight and a ±6–8° 3D tilt (pointer vars set in `landing-shell.tsx`)
  - art panel: triangle-lattice texture, red halo and a large floating line icon (`CARD_ICONS` maps the pixel glyph names)
  - outlined Pixelify number, a "live" chip holding the first tag, the remaining tags, and an arrow button that turns red and rotates on hover

## Later tweaks (2026-11-25)

- **Statement scene:** the mascot moved to (34%, 80%), clear of the centred menu button.
- **Two-tone lines:** the "What's this place?" heading is black and about 15% bigger. The intro and 9 PM drop lines use Pixelify and split in two (first half `.bbh-intro__lit`, white; second half `.bbh-intro__ink`, black) via `halves()` in `scenes.tsx`.
- **Pixel click** (`landing-shell.tsx`, `.bbh-burst`), from the owner's reference video of a pixel hand pointer:
  - eight 3px-pixel rays (stair-step diagonals) jump outward in 3 hard steps and vanish in one cut after 0.42s
  - colour: brand red over black; white over red scenes, red wipes and the red menu
  - skipped with reduced motion
- Don't commit the owner's reference video in the repo root (`vecteezy_click-icon-pixel-animation-hand-pointer-pressing-button-on_23950034.mp4`).

## Stage on every screen size (2026-11-25)

- `STAGE_QUERY` is now just `(prefers-reduced-motion: no-preference)`, so phones and tablets run the same scroll stage as laptops: wipes, scene transitions, the triangle mesh (light mode below 1024px wide) and the end loop. The load curtain runs at all sizes too.
- The progress rail is hidden below 640px wide, where it would overlap text. The swipe-carousel CSS applies only to the static layout (`:not([data-stage="on"])`).
- Only reduced-motion visitors get the static stacked page now. `lite.ts` is no longer reached (it only loads when the stage query fails and motion is allowed, which can't happen any more).

## Phones on the dev server (2026-11-25)

- **Why phones got a plain page:** Next 16 dev blocks its dev scripts (and the HMR websocket) for any host but `localhost`. A phone opening `http://<laptop-ip>:3000` (or a browser on `127.0.0.1`) therefore never hydrated.
- **Fix:** `allowedDevOrigins` in `next.config.ts`, covering private ranges only (`10.*.*.*`, `192.168.*.*`, `172.*.*.*`, `127.0.0.1`, `*.local`). This is dev-only; production was never affected.
- **Touch feel:** Lenis now runs with `syncTouch: true` (`syncTouchLerp: 0.075`), so swipes glide with the same weighted feel as the laptop wheel.
- **Testing touch:** emulate swipes with CDP `Input.dispatchTouchEvent` against `http://<laptop-ip>:3000`.

## Full experience even with "reduce motion" (2026-11-25)

- The owner's phones showed only the static page. The live site worked in Chromium and WebKit (iPhone and iPad emulation), so the cause was the device's reduced-motion setting: Android "Remove animations" (often switched on by battery saver) or iOS "Reduce Motion".
- At the owner's request, the landing now ignores that setting:
  - `STAGE_QUERY = "all"`
  - the page-wipe, the pixel click, the load curtain and the CSS animations no longer have reduced-motion fallbacks
- To honour the setting again, set `STAGE_QUERY` back to `(prefers-reduced-motion: no-preference)` and restore the removed `@media (prefers-reduced-motion: reduce)` blocks (see git history).
- Live site: https://bbhub.app (Netlify project `bbhub-app`, auto-deploys `main`).

## How to test

- `npx tsc --noEmit -p .`, `npx eslint components/landing`, `npm run build`, then `npx next start -p 3100`.
- Browser checks used Playwright from `/Users/punitp/.npm-global/lib/node_modules/rea-agents/node_modules/playwright-core/index.mjs` with chrome-headless-shell at `/Users/punitp/Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell`.
- **Regression sweep for the red screen** (`sweep.mjs <base> back|link|menu`):
  1. Load `/`, wait 3.6s, then record a signature (visible scenes, covering wipe, text lines in their clips, menu state) at every 400px of scroll, down and then up.
  2. Leave via Log in, the logo link or the Grievance menu link, then come back.
  3. Record the same signatures again. The result must be `diffs: 0` with no red over the hero at the top.
- Check at the owner's screen size, 1512×862 at 2× scale.

## Open items

- Nothing is committed yet.
- `/grievance` needs the real grievance officer's name and contact.
- A headless browser against `npm run dev` did not start the stage (the static layout showed); production works. Not yet explained; the owner's real browser on dev did run the stage.
- Not done: the feature cards, vault boxes and later-scene side glyphs still use the pixel glyphs. Change them only if asked.

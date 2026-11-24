import Image from "next/image";
import { ArrowDown } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { TransitionLink } from "@/components/page-transition";
import { DropCountdown } from "./countdown";
import { FlipButton } from "./flip-button";
import { LineIcon, type LineIconName } from "./line-icons";
import { PixelGlyph, type GlyphName } from "./pixel-glyph";
import {
  DOMAIN_NOTE,
  DROP_LINES,
  FEATURES,
  INTRO_LINES,
  VAULT_LINES,
  type Feature,
} from "./content";

/**
 * The landing page's scenes as plain markup. On phones and with reduced motion they stack as
 * normal sections; on desktop components/landing/motion.ts turns them into a scroll-driven stage.
 */

const vars = (values: Record<string, string | number>) => values as CSSProperties;

/** A clipped line of text. On desktop the inner span slides through the clip. */
function Line({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span className={`bbh-line ${className}`}>
      <span className="bbh-line__inner">{children}</span>
    </span>
  );
}

/** "BackBencher Hub", split into letters. The two capital B's of BackBencher are red. */
const TITLE = (() => {
  let index = 0;
  return [
    { text: "BackBencher", red: [0, 4] },
    { text: "Hub", red: [] as number[] },
  ].map((word) => ({
    text: word.text,
    chars: [...word.text].map((ch, i) => ({ ch, red: word.red.includes(i), index: index++ })),
  }));
})();

/** A hero icon: x and y are percentages of its column, size is the icon width in px. */
type Placed = { name: LineIconName; x: number; y: number; size: number };

// Two staggered sub-columns of small line icons per side, with tiny fillers between them.
const LEFT_ICONS: Placed[] = [
  { name: "desk", x: 9, y: 12, size: 40 },
  { name: "plus", x: 40, y: 11, size: 9 },
  { name: "bulb", x: 62, y: 15, size: 28 },
  { name: "cube", x: 36, y: 22, size: 12 },
  { name: "books", x: 14, y: 27, size: 32 },
  { name: "arrow", x: 70, y: 28, size: 15 },
  { name: "chat", x: 52, y: 35, size: 30 },
  { name: "mascot", x: 76, y: 36, size: 36 },
  { name: "dot", x: 8, y: 40, size: 5 },
  { name: "laptop", x: 18, y: 44, size: 40 },
  { name: "spark", x: 78, y: 46, size: 10 },
  { name: "pyramid", x: 58, y: 53, size: 17 },
  { name: "crown", x: 12, y: 61, size: 30 },
  { name: "bars", x: 40, y: 62, size: 13 },
  { name: "pencil", x: 64, y: 67, size: 26 },
  { name: "plus", x: 30, y: 72, size: 9 },
  { name: "tiles", x: 12, y: 77, size: 32 },
  { name: "ring", x: 50, y: 79, size: 8 },
  { name: "cup", x: 60, y: 84, size: 26 },
  { name: "tri", x: 6, y: 90, size: 10 },
  { name: "bench", x: 24, y: 89, size: 44 },
];

const RIGHT_ICONS: Placed[] = [
  { name: "hostel", x: 74, y: 11, size: 30 },
  { name: "plus", x: 50, y: 13, size: 9 },
  { name: "trophy", x: 32, y: 17, size: 28 },
  { name: "cubeRed", x: 60, y: 24, size: 13 },
  { name: "mascot", x: 12, y: 23, size: 36 },
  { name: "lock", x: 80, y: 30, size: 26 },
  { name: "bars", x: 28, y: 32, size: 13 },
  { name: "mask", x: 42, y: 38, size: 34 },
  { name: "dot", x: 90, y: 41, size: 5 },
  { name: "gamepad", x: 72, y: 46, size: 34 },
  { name: "tri", x: 24, y: 50, size: 10 },
  { name: "bell", x: 46, y: 55, size: 26 },
  { name: "wifi", x: 86, y: 57, size: 13 },
  { name: "clock", x: 70, y: 63, size: 30 },
  { name: "arrow", x: 30, y: 66, size: 15 },
  { name: "megaphone", x: 38, y: 74, size: 32 },
  { name: "spark", x: 88, y: 72, size: 10 },
  { name: "headphones", x: 74, y: 80, size: 28 },
  { name: "plus", x: 56, y: 84, size: 9 },
  { name: "pyramid", x: 30, y: 89, size: 17 },
  { name: "books", x: 64, y: 91, size: 32 },
];

function Column({ side, items }: { side: "l" | "r"; items: Placed[] }) {
  return (
    <div className={`bbh-col bbh-col--${side}`}>
      {items.map((item) => (
        <span
          key={`${item.name}-${item.x}-${item.y}`}
          // On phones the middle band holds the title, so those icons are hidden there.
          className={item.y > 30 && item.y < 70 ? "bbh-col__glyph bbh-col__glyph--mid" : "bbh-col__glyph"}
          style={{ left: `${item.x}%`, top: `${item.y}%`, width: item.size }}
        >
          <LineIcon name={item.name} />
        </span>
      ))}
    </div>
  );
}

// Background logos for the black scenes: five line icons each (one is always the AI chip),
// plus a couple of tiny fillers. x/y are percentages of the scene, size is px.
const STATEMENT_ICONS: Placed[] = [
  { name: "ai", x: 9, y: 18, size: 34 },
  { name: "chat", x: 84, y: 15, size: 30 },
  { name: "bulb", x: 14, y: 74, size: 28 },
  { name: "megaphone", x: 80, y: 72, size: 32 },
  { name: "cubeRed", x: 62, y: 86, size: 14 },
  { name: "plus", x: 30, y: 10, size: 9 },
  // Kept clear of the top centre, where the menu button docks.
  { name: "mascot", x: 34, y: 80, size: 30 },
  { name: "spark", x: 92, y: 44, size: 10 },
];

const INSIDE_ICONS: Placed[] = [
  { name: "ai", x: 6, y: 11, size: 32 },
  { name: "tiles", x: 18, y: 24, size: 26 },
  { name: "books", x: 30, y: 7, size: 22 },
  { name: "crown", x: 79, y: 9, size: 28 },
  { name: "gamepad", x: 91, y: 22, size: 30 },
  { name: "tri", x: 68, y: 20, size: 10 },
  { name: "mascot", x: 66, y: 4, size: 28 },
];

const VAULT_ICONS: Placed[] = [
  { name: "ai", x: 88, y: 11, size: 32 },
  { name: "lock", x: 5, y: 13, size: 26 },
  { name: "mask", x: 91, y: 80, size: 32 },
  { name: "laptop", x: 6, y: 82, size: 34 },
  { name: "hostel", x: 46, y: 5, size: 22 },
  { name: "plus", x: 24, y: 92, size: 9 },
  { name: "mascot", x: 90, y: 46, size: 30 },
];

const FOOTER_ICONS: Placed[] = [
  { name: "ai", x: 10, y: 20, size: 30 },
  { name: "desk", x: 85, y: 17, size: 34 },
  { name: "bench", x: 7, y: 76, size: 40 },
  { name: "trophy", x: 88, y: 72, size: 26 },
  { name: "headphones", x: 72, y: 90, size: 24 },
  { name: "spark", x: 30, y: 88, size: 10 },
  { name: "mascot", x: 91, y: 44, size: 30 },
];

function EdgeIcons({ items }: { items: Placed[] }) {
  return (
    <div className="bbh-edge" aria-hidden="true">
      {items.map((item, index) => (
        <span
          key={`${item.name}-${item.x}`}
          className="bbh-edge__icon"
          style={vars({ left: `${item.x}%`, top: `${item.y}%`, width: item.size, "--fi": index })}
        >
          <LineIcon name={item.name} />
        </span>
      ))}
    </div>
  );
}

/** Decorative glyphs at the edges of a scene (desktop stage only). */
function SideGlyphs({ left, right }: { left: GlyphName[]; right: GlyphName[] }) {
  return (
    <div className="bbh-side" aria-hidden="true">
      {left.map((name, i) => (
        <span
          key={`l-${name}`}
          className="bbh-side__glyph"
          style={{ left: `${3 + (i % 2) * 6}vw`, top: `${18 + i * 24}vh`, width: 28 + (i % 2) * 10 }}
        >
          <PixelGlyph name={name} />
        </span>
      ))}
      {right.map((name, i) => (
        <span
          key={`r-${name}`}
          className="bbh-side__glyph"
          style={{ right: `${3 + ((i + 1) % 2) * 6}vw`, top: `${14 + i * 26}vh`, width: 30 + (i % 2) * 10 }}
        >
          <PixelGlyph name={name} />
        </span>
      ))}
    </div>
  );
}

function Hero() {
  return (
    <section className="bbh-scene bbh-hero" data-scene="hero" aria-labelledby="bbh-hero-title">
      <div className="bbh-dots" aria-hidden="true" />
      <div className="bbh-cols" aria-hidden="true">
        <Column side="l" items={LEFT_ICONS} />
        <Column side="r" items={RIGHT_ICONS} />
      </div>

      <div className="bbh-hero__content">
        <h1 id="bbh-hero-title" className="bbh-hero__title">
          <span className="sr-only">BackBencher Hub</span>
          <span className="bbh-hero__words" aria-hidden="true">
            {TITLE.map((word) => (
              <span key={word.text} className="bbh-word">
                {word.chars.map((char) => (
                  <span key={char.index} className={char.red ? "bbh-char is-red" : "bbh-char"}>
                    <span className="bbh-char__move">
                      <span className="bbh-char__echo">{char.ch}</span>
                      <span className="bbh-char__main">{char.ch}</span>
                    </span>
                  </span>
                ))}
              </span>
            ))}
          </span>
        </h1>

        <div className="bbh-hero__below">
          <p className="bbh-tagline max-w-xs text-balance font-pixel text-[0.72rem] tracking-tight sm:max-w-none sm:text-[0.8rem]">
            We’ve got your back ,{" "}
            <span className="text-brand">you’ve got the bench.</span>
          </p>
          <div className="bbh-hero__cta">
            <FlipButton href="/join" label="Join Campus →" hoverLabel="Open /join" tone="red" />
            <p className="bbh-domains">
              <i aria-hidden="true" />
              {DOMAIN_NOTE}
            </p>
          </div>
        </div>
      </div>

      <div className="bbh-cue" aria-hidden="true">
        <div className="bbh-cue__inner">
          <span>Scroll down</span>
          <i />
        </div>
      </div>
    </section>
  );
}

function Statement() {
  return (
    <section className="bbh-scene bbh-statement" data-scene="statement" aria-label="What BBHub is for">
      <EdgeIcons items={STATEMENT_ICONS} />
      <p className="bbh-statement__text">
        <Line className="bbh-statement__a">what’s actually happening</Line>
        <Line className="bbh-statement__b">on campus.</Line>
      </p>
    </section>
  );
}

/**
 * Splits a line in two for the white/black treatment: after its first sentence, else after a
 * comma, else before " and " or " wins ", else at the space nearest the middle.
 */
function halves(text: string): [string, string] {
  const stop = text.indexOf(". ");
  if (stop > 0) return [text.slice(0, stop + 1), text.slice(stop + 2)];
  const comma = text.indexOf(", ");
  if (comma > 0) return [text.slice(0, comma + 1), text.slice(comma + 2)];
  for (const word of [" and ", " wins "]) {
    const at = text.indexOf(word);
    if (at > 0) return [text.slice(0, at), text.slice(at + 1)];
  }
  const mid = text.lastIndexOf(" ", Math.floor(text.length / 2));
  return [text.slice(0, mid), text.slice(mid + 1)];
}

function Intro() {
  return (
    <section id="about" className="bbh-scene bbh-intro" data-scene="intro" aria-labelledby="bbh-intro-title">
      <SideGlyphs left={["chat", "mask", "moon"]} right={["lock", "star", "bench"]} />
      <div className="bbh-intro__content">
        <h2 id="bbh-intro-title" className="bbh-intro__title">
          <Line>What’s this place?</Line>
        </h2>
        <ol className="bbh-intro__list">
          {INTRO_LINES.map((text, index) => (
            <li key={text}>
              <Line className="bbh-intro__item">
                <span className="bbh-num">{`0${index + 1}`}</span>
                <span>
                  <span className="bbh-intro__lit">{halves(text)[0]}</span>{" "}
                  <span className="bbh-intro__ink">{halves(text)[1]}</span>
                </span>
              </Line>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** Line icon shown on each feature card. */
const CARD_ICONS: Record<GlyphName, LineIconName> = {
  crown: "crown",
  trophy: "trophy",
  bowl: "cup",
  tiles: "tiles",
  flag: "hostel",
  board: "megaphone",
  bench: "bench",
  moon: "bulb",
  chat: "chat",
  star: "spark",
  lock: "lock",
  mask: "mask",
  heart: "chat",
  bolt: "bulb",
  bell: "bell",
};

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  const [lead, ...rest] = feature.tags;
  return (
    <article className="bbh-card">
      <div className="bbh-card__art">
        <span className="bbh-card__num">{String(index + 1).padStart(2, "0")}</span>
        <span className="bbh-card__chip">
          <i aria-hidden="true" />
          {lead}
        </span>
        <span className="bbh-card__halo" aria-hidden="true" />
        <LineIcon name={CARD_ICONS[feature.art]} className="bbh-card__icon" />
      </div>
      <h3 className="bbh-card__title">{feature.title}</h3>
      <p className="bbh-card__blurb">{feature.blurb}</p>
      <div className="bbh-card__foot">
        <ul className="bbh-card__tags">
          {rest.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
        <span className="bbh-card__go" aria-hidden="true">
          <svg viewBox="0 0 16 16">
            <path d="M3 8h10M9 4l4 4-4 4" />
          </svg>
        </span>
      </div>
    </article>
  );
}

function Inside() {
  return (
    <section id="inside" className="bbh-scene bbh-inside" data-scene="inside" aria-labelledby="bbh-inside-title">
      <EdgeIcons items={INSIDE_ICONS} />
      <div className="bbh-inside__headwrap">
        <h2 id="bbh-inside-title" className="bbh-inside__head">
          <Line className="bbh-inside__a">Inside the</Line>
          <Line className="bbh-inside__b">Bench</Line>
        </h2>
      </div>
      <div className="bbh-inside__panel">
        <ul className="bbh-track" aria-label="What’s inside BBHub">
          {FEATURES.map((feature, index) => (
            <li key={feature.id}>
              <FeatureCard feature={feature} index={index} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Drop() {
  return (
    <section id="drop" className="bbh-scene bbh-drop" data-scene="drop" aria-labelledby="bbh-drop-title">
      <SideGlyphs left={["moon", "bolt", "chat"]} right={["crown", "heart", "star"]} />
      <div className="bbh-drop__content">
        <h2 id="bbh-drop-title" className="bbh-drop__title">
          <Line>9 PM Daily Drop</Line>
        </h2>
        <p className="bbh-drop__slogan">from zero to crown</p>
        <div className="bbh-drop__info">
          <div className="bbh-drop__count">
            <DropCountdown />
          </div>
          <ul className="bbh-drop__list">
            {DROP_LINES.map((text) => (
              <li key={text}>
                <Line>
                  <span className="bbh-intro__lit">{halves(text)[0]}</span>{" "}
                  <span className="bbh-intro__ink">{halves(text)[1]}</span>
                </Line>
              </li>
            ))}
          </ul>
          <div className="bbh-drop__cta">
            <FlipButton href="/join" label="Enter Tonight’s Drop" hoverLabel="Go to /join" tone="ink" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Vault() {
  return (
    <section id="vault" className="bbh-scene bbh-vault" data-scene="vault" aria-labelledby="bbh-vault-title">
      <EdgeIcons items={VAULT_ICONS} />
      <div className="bbh-vault__content">
        <div className="bbh-vault__text">
          <h2 id="bbh-vault-title" className="bbh-vault__title">
            <Line>Two-Vault</Line>
            <Line className="bbh-vault__red">Anonymity</Line>
          </h2>
          <ul className="bbh-vault__list">
            {VAULT_LINES.map((text) => (
              <li key={text}>
                <Line>
                  <span className="bbh-intro__lit">{halves(text)[0]}</span>{" "}
                  <span className="bbh-intro__ink">{halves(text)[1]}</span>
                </Line>
              </li>
            ))}
          </ul>
          <div className="bbh-vault__cta">
            <FlipButton href="/join" label="Verify Campus Email" hoverLabel="Sign Up Free" tone="paper" />
          </div>
        </div>

        <div className="bbh-vault__diagram">
          <div className="bbh-vaultbox" data-vault-part="">
            <PixelGlyph name="lock" className="bbh-vaultbox__icon" />
            <p className="bbh-vaultbox__kicker">Vault 1 · Private</p>
            <p className="bbh-vaultbox__value">••••••@rishihood.edu.in</p>
            <p className="bbh-vaultbox__note">Checked once, to verify you</p>
          </div>
          <div className="bbh-vault__arrow" data-vault-part="" aria-hidden="true">
            <ArrowDown className="size-4" strokeWidth={2.5} />
            <span>one-way token</span>
          </div>
          <div className="bbh-vaultbox is-public" data-vault-part="">
            <PixelGlyph name="mask" className="bbh-vaultbox__icon" />
            <p className="bbh-vaultbox__kicker">Vault 2 · Public</p>
            <p className="bbh-vaultbox__value">Blue Lantern 7</p>
            <p className="bbh-vaultbox__note">All anyone else ever sees</p>
          </div>
        </div>
      </div>
    </section>
  );
}

const FOOTER_DESC =
  "The anonymous campus hub for Rishihood students. Verified by college email, known only by your username.";

function Footer() {
  return (
    <footer className="bbh-scene bbh-footer" data-scene="footer">
      <EdgeIcons items={FOOTER_ICONS} />
      <div className="bbh-footer__content">
        <span className="bbh-footer__tilewrap" data-reveal="">
          <Image src="/icon-512.png" alt="BBHub icon" width={104} height={104} className="bbh-footer__tile" />
        </span>
        <p className="bbh-footer__word" data-reveal="">
          <span className="text-brand">B</span>ack<span className="text-brand">B</span>encher Hub
        </p>
        <p className="bbh-footer__desc" data-reveal="">
          <span className="bbh-intro__lit">{halves(FOOTER_DESC)[0]}</span>{" "}
          <span className="bbh-intro__ink">{halves(FOOTER_DESC)[1]}</span>
        </p>
        <p className="bbh-footer__fine" data-reveal="">
          Student-run · Not affiliated with university administration
        </p>
        <nav className="bbh-footer__links" aria-label="Footer" data-reveal="">
          <TransitionLink href="/grievance">Grievance Officer</TransitionLink>
          <TransitionLink href="/join">Log in</TransitionLink>
        </nav>
      </div>
    </footer>
  );
}

export function Scenes() {
  return (
    <>
      <Hero />
      <Statement />
      <Intro />
      <Inside />
      <Drop />
      <Vault />
      <Footer />
    </>
  );
}

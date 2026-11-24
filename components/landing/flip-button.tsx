import { TransitionLink } from "@/components/page-transition";

type Tone = "red" | "ink" | "paper";

/**
 * Pill CTA with two stacked labels. On hover or keyboard focus a fill rises from the bottom while
 * the first label slides up and out and the second slides in from below.
 */
export function FlipButton({
  href,
  label,
  hoverLabel,
  tone,
  className = "",
}: {
  href: string;
  label: string;
  hoverLabel: string;
  tone: Tone;
  className?: string;
}) {
  return (
    <TransitionLink href={href} className={`bbh-flip bbh-flip--${tone} ${className}`}>
      <span className="bbh-flip__fill" aria-hidden="true" />
      <span className="bbh-flip__stack">
        <span className="bbh-flip__a">{label}</span>
        <span className="bbh-flip__b" aria-hidden="true">
          {hoverLabel}
        </span>
      </span>
    </TransitionLink>
  );
}

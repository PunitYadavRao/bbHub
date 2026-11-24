/**
 * Desktop gets the scroll-driven stage; phones, tablets and reduced-motion visitors get the
 * static stacked layout and never download GSAP or Lenis.
 */
export const STAGE_QUERY = "(min-width: 1024px) and (prefers-reduced-motion: no-preference)";

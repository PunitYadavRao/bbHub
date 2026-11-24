/**
 * The scroll-driven stage (wipes, scene transitions, triangle mesh, end loop) runs at every
 * screen size. Only visitors who ask for reduced motion get the static stacked layout, and
 * they never download GSAP or Lenis.
 */
export const STAGE_QUERY = "(prefers-reduced-motion: no-preference)";

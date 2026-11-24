/**
 * The scroll-driven stage (wipes, scene transitions, triangle mesh, end loop) runs on every
 * device and screen size, including when the device asks for reduced motion (Android "Remove
 * animations" / battery saver, iOS "Reduce Motion"): the owner wants phones to match the laptop
 * exactly. To honour that setting again, make this "(prefers-reduced-motion: no-preference)".
 */
export const STAGE_QUERY = "all";

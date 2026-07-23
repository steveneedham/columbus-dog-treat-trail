/**
 * @startingPoint section="Core" subtitle="Logo lockup + mono eyebrow subtitle, used in the top bar" viewport="700x100"
 */
export interface BrandProps {
  /** small uppercase mono line under the wordmark, e.g. "Stashes spotted on foot — v0.5" */
  subtitle?: string;
  /** path to the logo SVG, relative to the consuming page — e.g. "../../assets/logo-lockup.svg" */
  logoSrc?: string;
  /** intentional addition: show the Scout mascot mark alongside the wordmark */
  mascot?: boolean;
  /** path to the mascot mark SVG, relative to the consuming page — e.g. "../../assets/mascot/scout-mark.svg" */
  mascotSrc?: string;
}

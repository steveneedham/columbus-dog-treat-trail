/**
 * @startingPoint section="Core" subtitle="Map marker dot — type color fill, verified/unverified ring, dashed if seasonal, star ring if sponsored" viewport="700x110"
 */
export interface MapPinProps {
  /** stop-type fill color, e.g. var(--type-treat-stand) */
  color?: string;
  status?: 'verified' | 'unverified';
  /** dashed ring instead of solid, for seasonal stops */
  seasonal?: boolean;
  /** intentional addition: amber outline + star badge for a sponsored/featured stop (roadmap "commercial layer") */
  sponsored?: boolean;
  size?: number;
}

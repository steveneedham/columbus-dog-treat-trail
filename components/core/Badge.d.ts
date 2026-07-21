/**
 * @startingPoint section="Core" subtitle="Status badge — verified (moss), unverified (amber), seasonal (ink-soft)" viewport="700x110"
 */
export interface BadgeProps {
  status?: 'verified' | 'unverified' | 'seasonal';
  /** override the default label text */
  label?: string;
}

/**
 * @startingPoint section="Core" subtitle="Map-pin popup — stop name, photo, meta, notes, actions" viewport="700x360"
 */
export interface PopupCardProps {
  name: string;
  typeLabel: string;
  neighborhood: string;
  status?: 'verified' | 'unverified';
  seasonal?: boolean;
  /** raw venue answer, e.g. "private home" */
  venue?: string;
  notes?: string;
  photoUrl?: string;
  onMarkVerified?: () => void;
}

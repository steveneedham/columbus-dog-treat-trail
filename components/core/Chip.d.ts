/**
 * @startingPoint section="Core" subtitle="Filter chip with a color dot — toggles active/inactive" viewport="700x150"
 */
export interface ChipProps {
  label: string;
  /** dot color — use a --type-* token */
  color: string;
  /** optional icon path next to the label, e.g. an assets/icons/*.svg */
  icon?: string;
  active?: boolean;
  onClick?: () => void;
}

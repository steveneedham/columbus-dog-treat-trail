/**
 * @startingPoint section="Core" subtitle="Bordered button — default and primary (rust) variants" viewport="700x150"
 */
export interface ButtonProps {
  children: React.ReactNode;
  /** 'default' = white bg, ink border, inverts to ink on hover. 'primary' = rust fill, used for the one key action per screen (e.g. "Suggest a stop"). */
  variant?: 'default' | 'primary';
  icon?: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit';
}

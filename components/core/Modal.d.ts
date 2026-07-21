/**
 * @startingPoint section="Core" subtitle="Backdrop dialog — used for the single 'Suggest a stop' flow" viewport="700x280"
 */
export interface ModalProps {
  open: boolean;
  title: string;
  children: React.ReactNode;
  ctaLabel: string;
  ctaHref: string;
  onClose?: () => void;
}

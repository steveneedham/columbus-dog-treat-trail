/**
 * @startingPoint section="Feedback" subtitle="Bottom-center confirmation toast — success/error/info" viewport="700x120"
 */
export interface ToastProps {
  open: boolean;
  kind?: 'success' | 'error' | 'info';
  message: string;
  onClose?: () => void;
}

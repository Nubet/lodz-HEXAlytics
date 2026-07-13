import { useCallback } from 'react';
import type { ReactNode } from 'react';
import { classNames } from '@/utils/classNames';

interface ModalDialogProps {
  isOpen: boolean;
  label: string;
  onClose: () => void;
  className?: string;
  children: ReactNode;
}

export function ModalDialog({ isOpen, label, onClose, className, children }: ModalDialogProps) {
  const setDialogRef = useCallback((node: HTMLDialogElement | null) => {
    if (!node || node.open) return;
    node.showModal();
  }, []);

  if (!isOpen) return null;

  return (
    <dialog
      ref={setDialogRef}
      className={classNames('app-modal-dialog', className)}
      aria-label={label}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      {children}
    </dialog>
  );
}

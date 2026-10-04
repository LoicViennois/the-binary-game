import type { ReactNode } from 'react';

import { Modal } from './Modal';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  children: ReactNode;
}

export function ConfirmDialog({
  open,
  title,
  confirmLabel,
  onConfirm,
  onCancel,
  children,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      className="w-[min(26rem,calc(100%-2rem))]"
    >
      <div className="text-ink-soft">{children}</div>
      <div className="mt-6 flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="btn btn-ghost">
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="btn bg-alert text-surface hover:opacity-90"
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

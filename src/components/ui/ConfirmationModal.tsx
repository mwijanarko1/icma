"use client";

import BasicModal from "./BasicModal";

export type ConfirmationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
};

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm",
  message,
  confirmText = "Yes",
  cancelText = "No",
}: ConfirmationModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <BasicModal isOpen={isOpen} onClose={handleCancel} title={title} size="sm">
      <div className="space-y-6">
        <p className="text-sm leading-relaxed" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
          {message}
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:scale-105 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            style={{ fontFamily: 'var(--font-content)' }}
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-800 hover:scale-105 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            style={{ fontFamily: 'var(--font-content)' }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </BasicModal>
  );
}
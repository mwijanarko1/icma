"use client";

import { useState, useEffect } from 'react';
import BasicModal from "./BasicModal";

export type SessionNameModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string) => void;
  title?: string;
  message: string;
  defaultValue?: string;
};

export default function SessionNameModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Enter Session Name",
  message,
  defaultValue = "",
}: SessionNameModalProps) {
  const [sessionName, setSessionName] = useState(defaultValue);

  useEffect(() => {
    setSessionName(defaultValue);
  }, [defaultValue]);

  const handleConfirm = () => {
    if (sessionName.trim()) {
      onConfirm(sessionName.trim());
      onClose();
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirm();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <BasicModal isOpen={isOpen} onClose={handleCancel} title={title} size="sm">
      <div className="space-y-6">
        <p className="text-sm leading-relaxed" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
          {message}
        </p>
        <div className="space-y-2">
          <label htmlFor="session-name" className="block text-sm font-medium" style={{ fontFamily: 'var(--font-content)', color: '#000000' }}>
            Session Name:
          </label>
          <input
            id="session-name"
            type="text"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            onKeyDown={handleKeyPress}
            className="w-full px-3 py-2 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 bg-white"
            style={{ fontFamily: 'var(--font-content)' }}
            autoFocus
            placeholder="Enter a name for this analysis"
          />
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:scale-105 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            style={{ fontFamily: 'var(--font-content)' }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!sessionName.trim()}
            className="px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-800 hover:scale-105 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: 'var(--font-content)' }}
          >
            Save
          </button>
        </div>
      </div>
    </BasicModal>
  );
}
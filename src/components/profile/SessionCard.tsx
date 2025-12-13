"use client";

import { useState } from "react";
import { Timestamp } from "firebase/firestore";

interface SessionCardProps {
  id: string;
  name: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  preview?: string;
  onLoad: () => void;
  onDelete: () => void;
  onRename: (newName: string) => void;
  isLoading?: boolean;
}

export default function SessionCard({
  id,
  name,
  createdAt,
  updatedAt,
  preview,
  onLoad,
  onDelete,
  onRename,
  isLoading = false,
}: SessionCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(name);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const formatDate = (timestamp: Timestamp) => {
    const date = timestamp.toDate();
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleRename = () => {
    if (editedName.trim() && editedName !== name) {
      onRename(editedName.trim());
    }
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete();
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
    }
  };

  return (
    <div
      className="rounded-lg border-2 border-black bg-white p-4 hover:shadow-lg transition-all duration-200"
      style={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}
    >
      <div className="flex items-start justify-between mb-3">
        {isEditing ? (
          <div className="flex-1 flex items-center gap-2">
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRename();
                if (e.key === "Escape") {
                  setEditedName(name);
                  setIsEditing(false);
                }
              }}
              className="flex-1 px-3 py-1 rounded border-2 border-black text-sm font-semibold"
              style={{ fontFamily: "var(--font-content)", color: "#000000" }}
              autoFocus
            />
          </div>
        ) : (
          <div className="flex-1">
            <h3
              className="font-semibold text-lg mb-1 cursor-pointer hover:opacity-70"
              onClick={() => setIsEditing(true)}
              style={{ fontFamily: "var(--font-title)", color: "#000000" }}
            >
              {name}
            </h3>
            <div className="flex flex-col gap-1 text-xs" style={{ fontFamily: "var(--font-content)", color: "#000000", opacity: 0.6 }}>
              <span>Created: {formatDate(createdAt)}</span>
              <span>Updated: {formatDate(updatedAt)}</span>
            </div>
          </div>
        )}
      </div>

      {preview && (
        <p
          className="text-sm mb-3 line-clamp-2"
          style={{ fontFamily: "var(--font-content)", color: "#000000", opacity: 0.7 }}
        >
          {preview}
        </p>
      )}

      <div className="flex items-center gap-2">
        <button
          onClick={onLoad}
          disabled={isLoading}
          className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:shadow-md hover:scale-105 hover:-translate-y-1 disabled:opacity-50 border-2 border-black"
          style={{ backgroundColor: "#000000", color: "#f2e9dd", fontFamily: "var(--font-content)" }}
        >
          {isLoading ? "Loading..." : "Load"}
        </button>
        {showDeleteConfirm ? (
          <>
            <button
              onClick={handleDelete}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:shadow-md border-2 border-red-500"
              style={{ backgroundColor: "#fee2e2", color: "#dc2626", fontFamily: "var(--font-content)" }}
            >
              Confirm
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:shadow-md border-2 border-black"
              style={{ backgroundColor: "#f2e9dd", color: "#000000", fontFamily: "var(--font-content)" }}
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:shadow-md border-2 border-black"
              style={{ backgroundColor: "#f2e9dd", color: "#000000", fontFamily: "var(--font-content)" }}
            >
              Rename
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:shadow-md border-2 border-red-500"
              style={{ backgroundColor: "#fee2e2", color: "#dc2626", fontFamily: "var(--font-content)" }}
            >
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
}

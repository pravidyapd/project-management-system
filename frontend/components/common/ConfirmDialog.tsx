
"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDialogProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loading) {
        onCancel();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, loading, onCancel]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onCancel();
        }
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="page-enter w-full max-w-md rounded-2xl border border-white/10 bg-[#171717] p-6 shadow-2xl shadow-black/50"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-red-400">
              <AlertTriangle size={22} />
            </div>

            <h2
              id="confirm-dialog-title"
              className="text-lg font-bold text-white"
            >
              {title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            aria-label="Close dialog"
            className="rounded-full p-2 text-zinc-400 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <p className="mt-5 text-sm leading-relaxed text-zinc-300">
          {message}
        </p>

        <div className="mt-7 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-full border border-white/10 bg-zinc-800 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

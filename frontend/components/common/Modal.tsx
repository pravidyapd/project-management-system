
"use client";

import { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
}

export default function Modal({
  open,
  title,
  description,
  children,
  onClose,
}: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4 backdrop-blur-md dark:bg-black/50"
      onMouseDown={onClose}
    >
      <div
        className="page-enter w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl shadow-black/20 dark:border-white/10 dark:bg-[#171717] dark:shadow-black/50"
        onMouseDown={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-zinc-200 bg-zinc-50 p-5 dark:border-white/10 dark:bg-[#1c1c1c]">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
              {title}
            </h2>

            {description && (
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                {description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-full p-2 text-zinc-500 transition-all hover:bg-orange-500/10 hover:text-orange-600 dark:text-zinc-400 dark:hover:text-orange-400"
          >
            <X size={21} />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[75vh] overflow-y-auto p-6 text-zinc-900 dark:text-white">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}

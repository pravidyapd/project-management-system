
"use client";

import { ReactNode, useEffect } from "react";
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

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div
        className="page-enter w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#171717] shadow-2xl shadow-black/50"
        onMouseDown={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 bg-[#1c1c1c] p-5">
          <div>
            <h2 className="text-xl font-bold text-white">
              {title}
            </h2>

            {description && (
              <p className="mt-1 text-sm text-zinc-300">
                {description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-full p-2 text-zinc-400 transition-all hover:bg-orange-500/10 hover:text-orange-400"
          >
            <X size={21} />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[75vh] overflow-y-auto p-6 text-white">
          {children}
        </div>
      </div>
    </div>
  );
}

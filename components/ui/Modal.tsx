"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { GlassButton } from "./GlassButton";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  /** Max width class, e.g. "max-w-lg" (default) */
  maxWidth?: string;
}

/**
 * Modal — accessible dialog with glass-card surface, focus trap, and backdrop dismiss.
 */
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "max-w-lg",
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) onClose();
  };

  // Close on Escape
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDialogElement>) => {
    if (e.key === "Escape") onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      className={cn(
        "glass-card rounded-xl p-0 w-full backdrop:bg-black/60 backdrop:backdrop-blur-sm",
        "open:animate-in open:fade-in-0 open:zoom-in-95",
        maxWidth
      )}
      onMouseDown={handleBackdropClick}
      onKeyDown={handleKeyDown}
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/8 px-6 py-4">
        <h2
          id="modal-title"
          className="text-base font-semibold text-white"
        >
          {title}
        </h2>
        <GlassButton
          variant="ghost"
          size="sm"
          onClick={onClose}
          aria-label="Close dialog"
          className="!px-2 !py-1"
        >
          ✕
        </GlassButton>
      </div>

      {/* Body */}
      <div className="px-6 py-5">{children}</div>
    </dialog>
  );
}

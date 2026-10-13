"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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
 * Modal — fully centered dialog portal with frosted glass surface,
 * backdrop blur, Escape key support, and focus lock.
 */
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "max-w-lg",
}: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex min-h-screen w-screen items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-md animate-in fade-in-0 duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className={cn(
          "glass-card relative my-auto w-full rounded-2xl border border-white/10 bg-[#0f172a]/95 p-0 shadow-2xl shadow-black/80 animate-in zoom-in-95 duration-200",
          maxWidth
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h2
            id="modal-title"
            className="text-base font-semibold tracking-tight text-white"
          >
            {title}
          </h2>
          <GlassButton
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Close dialog"
            className="!h-8 !w-8 !p-0 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white"
          >
            ✕
          </GlassButton>
        </div>

        {/* Body */}
        <div className="max-h-[82vh] overflow-y-auto px-6 py-5">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}

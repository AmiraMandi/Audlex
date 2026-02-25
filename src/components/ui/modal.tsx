"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useEffect } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizes = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export function Modal({ open, onClose, title, description, children, className, size = "md" }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      {/* Content */}
      <div
        className={cn(
          "relative z-10 w-full mx-4 rounded-2xl bg-surface-secondary border border-border shadow-2xl max-h-[90vh] flex flex-col",
          sizes[size],
          className
        )}
      >
        {(title || description) && (
          <div className="flex items-start justify-between px-6 py-5 border-b border-border">
            <div>
              {title && <h2 className="text-lg font-semibold text-text">{title}</h2>}
              {description && <p className="text-sm text-text-secondary mt-1">{description}</p>}
            </div>
            <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-surface-tertiary transition">
              <X className="h-5 w-5 text-text-muted" />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';

// ─── Size map ───────────────────────────────────────────────────────────────
const SIZE_CLASS = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
} as const;

// ─── Animation variants ─────────────────────────────────────────────────────
const overlayVariants: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2, ease: 'easeOut' as const } },
  exit:    { opacity: 0, transition: { duration: 0.15, ease: 'easeIn' as const } },
};

const panelVariants: Variants = {
  hidden:  { opacity: 0, scale: 0.94, y: 20 },
  visible: {
    opacity: 1, scale: 1, y: 0,
    transition: { type: 'spring' as const, stiffness: 320, damping: 30, mass: 0.8, delay: 0.03 },
  },
  exit: {
    opacity: 0, scale: 0.97, y: 8,
    transition: { duration: 0.13, ease: 'easeIn' as const },
  },
};

// ─── Types ───────────────────────────────────────────────────────────────────
export interface GlassModalProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: keyof typeof SIZE_CLASS;
  /** Click on the dim overlay to close (default: true) */
  closeOnBackdrop?: boolean;
  showCloseButton?: boolean;
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function GlassModal({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnBackdrop = true,
  showCloseButton = true,
}: GlassModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Escape key handler
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    document.addEventListener('keydown', handleKeyDown);
    // Lock body scroll
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prev;
    };
  }, [open, handleKeyDown]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdrop && e.target === e.currentTarget) onClose();
  };

  const modal = (
    <AnimatePresence>
      {open && (
        // ── Overlay ──────────────────────────────────────────────────────────
        <motion.div
          className="fixed inset-0 z-[9998] flex items-center justify-center p-4
                     bg-slate-900/55 backdrop-blur-[3px]"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={handleBackdropClick}
          aria-modal="true"
          role="dialog"
          aria-label={typeof title === 'string' ? title : 'Dialog'}
        >
          {/* ── Panel ────────────────────────────────────────────────────── */}
          <motion.div
            ref={panelRef}
            className={`
              relative w-full ${SIZE_CLASS[size]}
              bg-white/82 backdrop-blur-2xl
              border border-white/60
              rounded-2xl overflow-hidden
              shadow-[0_32px_80px_rgba(15,23,42,0.22),0_8px_24px_rgba(15,23,42,0.10)]
              ring-1 ring-slate-900/5
            `}
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Top accent gradient line */}
            <div
              className="absolute inset-x-0 top-0 h-px
                         bg-gradient-to-r from-transparent via-[#4db694]/60 to-transparent"
            />

            {/* ── Header ─────────────────────────────────────────────────── */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-200/60">
                {title && (
                  <h2 className="text-base font-semibold text-slate-800 leading-snug">
                    {title}
                  </h2>
                )}
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="
                      ml-auto -mr-1 flex items-center justify-center w-8 h-8 rounded-lg
                      text-slate-400 hover:text-slate-700 hover:bg-slate-100/80
                      transition-colors duration-150
                    "
                    aria-label="Close"
                  >
                    <X size={16} strokeWidth={2.5} />
                  </button>
                )}
              </div>
            )}

            {/* ── Body ───────────────────────────────────────────────────── */}
            <div className="px-6 py-5 text-slate-700 text-sm leading-relaxed overflow-y-auto max-h-[65vh]">
              {children}
            </div>

            {/* ── Footer ─────────────────────────────────────────────────── */}
            {footer && (
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200/60 bg-slate-50/60">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modal, document.body);
}

// ─── Preset footer buttons ────────────────────────────────────────────────────
export function ModalCancelButton({
  onClick,
  children = 'Cancel',
}: {
  onClick: () => void;
  children?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        px-4 py-2 text-sm font-medium rounded-lg
        text-slate-600 bg-white border border-slate-200
        hover:bg-slate-50 hover:border-slate-300
        active:scale-[0.98]
        transition-all duration-150
      "
    >
      {children}
    </button>
  );
}

export function ModalConfirmButton({
  onClick,
  children = 'Confirm',
  variant = 'primary',
  disabled,
  loading,
}: {
  onClick: () => void;
  children?: React.ReactNode;
  variant?: 'primary' | 'danger';
  disabled?: boolean;
  loading?: boolean;
}) {
  const base = 'px-4 py-2 text-sm font-medium rounded-lg text-white active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2';
  const color = variant === 'danger'
    ? 'bg-red-500 hover:bg-red-600 shadow-sm shadow-red-200'
    : 'bg-[#4db694] hover:bg-[#3da884] shadow-sm shadow-emerald-200';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${color}`}
    >
      {loading && <Loader2 size={14} className="animate-spin" />}
      {children}
    </button>
  );
}

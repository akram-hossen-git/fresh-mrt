'use client';

import React, { useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const sizeStyles = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-[90vw] max-h-[90vh]',
} as const;

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: keyof typeof sizeStyles;
  className?: string;
}

function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  className,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Handle Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current = document.activeElement as HTMLElement;
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    // Focus the content container
    const timer = setTimeout(() => {
      contentRef.current?.focus();
    }, 50);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      clearTimeout(timer);
      previousFocusRef.current?.focus();
    };
  }, [isOpen, handleKeyDown]);

  // Handle focus trap within modal
  useEffect(() => {
    if (!isOpen || !contentRef.current) return;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !contentRef.current) return;

      const focusable = contentRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );

      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleTabKey);
    return () => document.removeEventListener('keydown', handleTabKey);
  }, [isOpen]);

  // Close on overlay click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center p-4',
        'bg-black/50 backdrop-blur-sm',
        'animate-fade-in'
      )}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        ref={contentRef}
        tabIndex={-1}
        className={cn(
          'relative w-full overflow-y-auto rounded-card bg-white p-6 shadow-modal outline-none',
          'dark:bg-gray-900',
          'animate-scale-in',
          sizeStyles[size],
          className
        )}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 inline-flex items-center justify-center w-8 h-8 rounded-[8px] text-gray-500 hover:text-black hover:bg-gray-100 transition-all duration-300 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Title */}
        {title && (
          <h2 className="text-xl font-semibold text-black dark:text-white mb-4 pr-8 font-[var(--font-heading)]">
            {title}
          </h2>
        )}

        {/* Content */}
        {children}
      </div>
    </div>,
    document.body
  );
}

export { Modal };

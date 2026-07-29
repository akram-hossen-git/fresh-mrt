'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  type ReactNode,
} from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  exiting?: boolean;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const TOAST_DURATION = 4000;
const EXIT_ANIMATION_MS = 300;

/* -------------------------------------------------------------------------- */
/*  Toast icons by type                                                       */
/* -------------------------------------------------------------------------- */

const iconMap: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 size={18} className="shrink-0" />,
  error: <AlertCircle size={18} className="shrink-0" />,
  info: <Info size={18} className="shrink-0" />,
};

/* -------------------------------------------------------------------------- */
/*  Per-toast colours -- premium black/white/accent theme                     */
/* -------------------------------------------------------------------------- */

const styleMap: Record<
  ToastType,
  { bg: string; border: string; icon: string; text: string }
> = {
  success: {
    bg: 'bg-white dark:bg-neutral-900',
    border: 'border-emerald-500',
    icon: 'text-emerald-500',
    text: 'text-neutral-900 dark:text-neutral-100',
  },
  error: {
    bg: 'bg-white dark:bg-neutral-900',
    border: 'border-red-500',
    icon: 'text-red-500',
    text: 'text-neutral-900 dark:text-neutral-100',
  },
  info: {
    bg: 'bg-white dark:bg-neutral-900',
    border: 'border-accent',
    icon: 'text-accent',
    text: 'text-neutral-900 dark:text-neutral-100',
  },
};

/* -------------------------------------------------------------------------- */
/*  Individual toast component                                                */
/* -------------------------------------------------------------------------- */

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const s = styleMap[toast.type];

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      onDismiss(toast.id);
    }, TOAST_DURATION);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [toast.id, onDismiss]);

  return (
    <div
      className={[
        // layout
        'flex items-center gap-3 min-w-[300px] max-w-md px-4 py-3 rounded-lg',
        // border accent
        'border-l-4',
        s.border,
        // background & shadow
        s.bg,
        'shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)]',
        // animation
        toast.exiting
          ? 'animate-toast-exit'
          : 'animate-toast-enter',
      ].join(' ')}
      role="alert"
    >
      <span className={s.icon}>{iconMap[toast.type]}</span>
      <span className={`flex-1 text-sm font-medium ${s.text}`}>
        {toast.message}
      </span>
      <button
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
        aria-label="Dismiss toast"
      >
        <X size={16} />
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Toast provider                                                            */
/* -------------------------------------------------------------------------- */

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: string) => {
    // Mark as exiting to trigger fade-out animation
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
    );

    // Remove from DOM after exit animation completes
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, EXIT_ANIMATION_MS);
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id =
      Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Fixed toast container -- bottom-right */}
      <div
        className="fixed bottom-6 right-6 z-[9999] flex flex-col-reverse gap-3 pointer-events-auto"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
        ))}
      </div>

      {/* Inline keyframes -- no tailwind.config changes required */}
      <style jsx global>{`
        @keyframes toast-enter {
          from {
            opacity: 0;
            transform: translateY(16px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes toast-exit {
          from {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          to {
            opacity: 0;
            transform: translateY(8px) scale(0.96);
          }
        }
        .animate-toast-enter {
          animation: toast-enter 0.3s ease-out forwards;
        }
        .animate-toast-exit {
          animation: toast-exit 0.3s ease-in forwards;
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

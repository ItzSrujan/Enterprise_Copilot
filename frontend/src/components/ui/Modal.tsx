import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/utils/helpers';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-surface-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative w-full rounded-lg border border-surface-200 bg-white p-6 shadow-xl transition-all',
          maxWidthStyles[maxWidth]
        )}
      >
        <div className="flex items-start justify-between pb-3">
          <div>
            <h3 className="text-base font-semibold text-surface-900">{title}</h3>
            {description && (
              <p className="mt-1 text-xs text-surface-500">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-surface-400 hover:bg-surface-100 hover:text-surface-700 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="pt-2">{children}</div>
      </div>
    </div>
  );
}


import { useEffect, useRef, type RefObject } from 'react';

interface DialogFocusOptions {
  initialFocusRef?: RefObject<HTMLElement | null>;
  onEscape?: () => void;
}

export function useDialogFocus<T extends HTMLElement>({
  initialFocusRef,
  onEscape,
}: DialogFocusOptions = {}) {
  const dialogRef = useRef<T>(null);
  const onEscapeRef = useRef(onEscape);

  useEffect(() => {
    onEscapeRef.current = onEscape;
  }, [onEscape]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const previouslyFocused = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const getFocusableElements = () => Array.from(dialog.querySelectorAll<HTMLElement>(
      'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
    )).filter(element => element.getAttribute('aria-hidden') !== 'true' && element.getClientRects().length > 0);

    const focusFirst = () => {
      (initialFocusRef?.current ?? getFocusableElements()[0] ?? dialog).focus();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onEscapeRef.current) {
        event.preventDefault();
        onEscapeRef.current();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];
      if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    };

    const handleFocusIn = (event: FocusEvent) => {
      if (!dialog.contains(event.target as Node)) focusFirst();
    };

    focusFirst();
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('focusin', handleFocusIn);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('focusin', handleFocusIn);
      if (previouslyFocused?.isConnected) previouslyFocused.focus();
    };
  }, [initialFocusRef]);

  return dialogRef;
}
/**
 * useFieldError hook for managing field error state
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import type { FormattedError } from '../errors/types';

/**
 * Configuration options for useFieldError hook
 */
export interface UseFieldErrorOptions {
  /** Initial error message */
  initialError?: string | null;
  /** Field name for filtering errors */
  fieldName?: string;
  /** Auto-dismiss error after delay (ms) */
  autoDismiss?: number;
  /** Callback when error changes */
  onErrorChange?: (error: string | null) => void;
}

/**
 * Return type of useFieldError hook
 */
export interface UseFieldErrorReturn {
  /** Current error message */
  error: string | null;
  /** All errors for the field */
  errors: string[];
  /** Whether field has error */
  hasError: boolean;
  /** Set error message */
  setError: (error: string | null) => void;
  /** Set multiple errors */
  setErrors: (errors: string[]) => void;
  /** Add an error to existing errors */
  addError: (error: string) => void;
  /** Clear all errors */
  clearError: () => void;
  /** Set errors from formatted error objects */
  setFormattedErrors: (formattedErrors: FormattedError[]) => void;
}

/**
 * Hook for managing field error state
 * @param options - Error configuration options
 * @returns Error state and methods
 */
export function useFieldError(options: UseFieldErrorOptions = {}): UseFieldErrorReturn {
  const { initialError = null, fieldName, autoDismiss, onErrorChange } = options;

  const [error, setErrorState] = useState<string | null>(initialError);
  const [errors, setErrorsState] = useState<string[]>(initialError ? [initialError] : []);

  const hasError = useMemo(() => error !== null, [error]);

  // Set up auto-dismiss when error changes
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (autoDismiss && autoDismiss > 0 && error) {
      timer = setTimeout(() => {
        setErrorState(null);
        setErrorsState([]);
        onErrorChange?.(null);
      }, autoDismiss);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [error, autoDismiss, onErrorChange]);

  // Set single error
  const setError = useCallback(
    (newError: string | null) => {
      setErrorState(newError);
      setErrorsState(newError ? [newError] : []);
      onErrorChange?.(newError);
    },
    [onErrorChange],
  );

  // Set multiple errors
  const setErrors = useCallback(
    (newErrors: string[]) => {
      const firstError = newErrors.length > 0 ? newErrors[0] : null;
      setErrorState(firstError);
      setErrorsState(newErrors);
      onErrorChange?.(firstError);
    },
    [onErrorChange],
  );

  // Add error to existing errors
  const addError = useCallback(
    (newError: string) => {
      setErrorsState((prev) => {
        const updated = [...prev, newError];
        setErrorState(updated[0]);
        onErrorChange?.(updated[0]);
        return updated;
      });
    },
    [onErrorChange],
  );

  // Clear all errors
  const clearError = useCallback(() => {
    setErrorState(null);
    setErrorsState([]);
    onErrorChange?.(null);
  }, [onErrorChange]);

  // Set errors from formatted error objects
  const setFormattedErrors = useCallback(
    (formattedErrors: FormattedError[]) => {
      // Filter by field name if provided
      const relevantErrors = fieldName
        ? formattedErrors.filter((err) => err.field === fieldName)
        : formattedErrors;

      const errorMessages = relevantErrors.map((err) => err.message);
      const firstError = errorMessages.length > 0 ? errorMessages[0] : null;

      setErrorState(firstError);
      setErrorsState(errorMessages);
      onErrorChange?.(firstError);
    },
    [fieldName, onErrorChange],
  );

  return {
    error,
    errors,
    hasError,
    setError,
    setErrors,
    addError,
    clearError,
    setFormattedErrors,
  };
}

/**
 * useAsyncValidation - Debounced async field validation with AbortController
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { DEFAULT_DEBOUNCE_MS } from '../core/types';

/**
 * Async validator function signature
 */
export type AsyncValidatorFn<TValue = unknown> = (
  value: TValue,
  ctx: { signal: AbortSignal },
) => Promise<string | null>;

/**
 * Options for useAsyncValidation hook
 */
export interface UseAsyncValidationOptions<TValue = unknown> {
  /** The async validator function */
  validate: AsyncValidatorFn<TValue>;
  /** Current field value */
  value: TValue;
  /** Debounce delay in ms (default: 300) */
  debounceMs?: number;
  /** Whether validation is enabled */
  enabled?: boolean;
}

/**
 * Return type for useAsyncValidation hook
 */
export interface UseAsyncValidationReturn {
  /** Current validation error (null if valid) */
  error: string | null;
  /** Whether validation is in progress */
  isValidating: boolean;
  /** Manually trigger validation */
  triggerValidation: () => void;
}

/**
 * Hook for debounced async field validation
 * Automatically cancels in-flight requests on value change or unmount
 *
 * @param options - Async validation configuration
 * @returns Validation state and methods
 *
 * @example
 * ```tsx
 * const { error, isValidating } = useAsyncValidation({
 *   validate: async (email, { signal }) => {
 *     const exists = await checkEmailExists(email, signal);
 *     return exists ? 'Email already taken' : null;
 *   },
 *   value: email,
 *   debounceMs: 400,
 * });
 * ```
 */
export function useAsyncValidation<TValue = unknown>(
  options: UseAsyncValidationOptions<TValue>,
): UseAsyncValidationReturn {
  const { validate, value, debounceMs = DEFAULT_DEBOUNCE_MS, enabled = true } = options;

  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  // Refs for cleanup
  const abortControllerRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Run validation
  const runValidation = useCallback(async () => {
    // Abort any existing request
    cleanup();

    if (!enabled) {
      return;
    }

    // Create new AbortController
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsValidating(true);

    try {
      const result = await validate(value, { signal: controller.signal });

      // Only update if not aborted
      if (!controller.signal.aborted) {
        setError(result);
        setIsValidating(false);
      }
    } catch (err) {
      // Ignore abort errors
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }

      // Only update if not aborted
      if (!controller.signal.aborted) {
        setError('Validation failed');
        setIsValidating(false);
      }
    }
  }, [cleanup, enabled, validate, value]);

  // Debounced validation on value change
  useEffect(() => {
    if (!enabled) {
      // Skip validation when disabled - state reset handled by separate effect
      return;
    }

    // Clear existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Set new timer
    timerRef.current = setTimeout(runValidation, debounceMs);

    // Cleanup on unmount or value change
    return cleanup;
  }, [value, enabled, debounceMs, runValidation, cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Manual trigger
  const triggerValidation = useCallback(() => {
    cleanup();
    runValidation();
  }, [cleanup, runValidation]);

  // Use derived state: when disabled, always return null/false
  return {
    error: enabled ? error : null,
    isValidating: enabled ? isValidating : false,
    triggerValidation,
  };
}

/**
 * useValidation hook for field validation logic
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import type { FieldValue } from '../utils/types';
import type {
  ValidationRule,
  ValidationState,
  ValidationOptions,
  ValidationContext,
  ValidatorFn,
} from '../validation/types';

/**
 * Configuration options for useValidation hook
 */
export interface UseValidationOptions extends ValidationOptions {
  /** Validation rules to apply */
  rules?: ValidationRule[];
  /** Single validator function (alternative to rules) */
  validator?: ValidatorFn;
  /** Validation context for cross-field validation */
  context?: ValidationContext;
}

/**
 * Return type of useValidation hook
 */
export interface UseValidationReturn extends ValidationState {
  /** Validate the field value */
  validate: (value: FieldValue, trigger?: ValidationRule['trigger']) => Promise<boolean>;
  /** Clear validation errors */
  clearErrors: () => void;
  /** Set validation error manually */
  setError: (error: string | null) => void;
  /** Set multiple errors */
  setErrors: (errors: string[]) => void;
}

/**
 * Hook for managing field validation
 * @param options - Validation configuration options
 * @returns Validation state and methods
 */
export function useValidation(options: UseValidationOptions = {}): UseValidationReturn {
  const { rules = [], validator, context, debounce = 0, abortEarly = true } = options;

  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const isValid = error === null && errors.length === 0;

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Run validation
  const runValidation = useCallback(
    async (value: FieldValue): Promise<{ isValid: boolean; errors: string[] }> => {
      const validationErrors: string[] = [];

      // Use single validator if provided
      if (validator) {
        const result = await Promise.resolve(validator(value, context));
        if (result) {
          return { isValid: false, errors: [result] };
        }
        return { isValid: true, errors: [] };
      }

      // Run validation rules
      for (const rule of rules) {
        try {
          const result = await Promise.resolve(rule.validator(value, context));
          if (result) {
            const errorMessage = rule.message || result;
            validationErrors.push(errorMessage);

            // Stop on first error if abortEarly is true
            if (abortEarly) {
              break;
            }
          }
        } catch (err) {
          // Handle validation errors
          const errorMessage = err instanceof Error ? err.message : 'Validation failed';
          validationErrors.push(errorMessage);

          if (abortEarly) {
            break;
          }
        }
      }

      return {
        isValid: validationErrors.length === 0,
        errors: validationErrors,
      };
    },
    [rules, validator, context, abortEarly],
  );

  // Validate with optional trigger filter
  const validate = useCallback(
    async (value: FieldValue, trigger?: ValidationRule['trigger']): Promise<boolean> => {
      // Cancel any pending validation
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      // Filter rules by trigger if specified
      const applicableRules = trigger
        ? rules.filter((rule) => !rule.trigger || rule.trigger === trigger)
        : rules;

      // If no applicable rules and no validator, consider valid
      if (applicableRules.length === 0 && !validator) {
        setError(null);
        setErrors([]);
        return true;
      }

      setIsValidating(true);

      try {
        const result = await runValidation(value);

        // Check if aborted
        if (abortControllerRef.current?.signal.aborted) {
          return false;
        }

        setError(result.errors[0] || null);
        setErrors(result.errors);
        setIsValidating(false);

        return result.isValid;
      } catch (err) {
        if (abortControllerRef.current?.signal.aborted) {
          return false;
        }

        const errorMessage = err instanceof Error ? err.message : 'Validation failed';
        setError(errorMessage);
        setErrors([errorMessage]);
        setIsValidating(false);
        return false;
      }
    },
    [rules, validator, runValidation],
  );

  // Validate with debounce
  const validateDebounced = useCallback(
    (value: FieldValue, trigger?: ValidationRule['trigger']): Promise<boolean> => {
      return new Promise((resolve) => {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }

        if (debounce > 0) {
          debounceTimerRef.current = setTimeout(async () => {
            const result = await validate(value, trigger);
            resolve(result);
          }, debounce);
        } else {
          validate(value, trigger).then(resolve);
        }
      });
    },
    [validate, debounce],
  );

  // Clear all errors
  const clearErrors = useCallback(() => {
    setError(null);
    setErrors([]);
    setIsValidating(false);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Set error manually
  const setErrorManually = useCallback((err: string | null) => {
    setError(err);
    setErrors(err ? [err] : []);
  }, []);

  // Set multiple errors
  const setErrorsManually = useCallback((errs: string[]) => {
    setError(errs[0] || null);
    setErrors(errs);
  }, []);

  return {
    isValidating,
    isValid,
    error,
    errors,
    validate: validateDebounced,
    clearErrors,
    setError: setErrorManually,
    setErrors: setErrorsManually,
  };
}

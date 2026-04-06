/**
 * useFormKit - Master form state management hook
 * Internal hook powering DynamicForm
 */

import { useState, useCallback, useMemo, useRef } from 'react';
import type { z } from 'zod';
import type { FormValues, FieldValue, ValidationMode } from '../core/types';
import type { FieldErrors } from '../core/validator';
import type { FormContextValue } from '../models/FormState';
import { mapZodErrors } from '../core/validator';

/**
 * Options for useFormKit hook
 */
export interface UseFormKitOptions<TValues extends FormValues = FormValues> {
  /** Zod schema for validation */
  schema?: z.ZodType<TValues>;
  /** Initial/default values */
  defaultValues: Partial<TValues>;
  /** Validation mode */
  mode?: ValidationMode;
}

/**
 * Return type for useFormKit hook
 */
export interface UseFormKitReturn<TValues extends FormValues = FormValues> {
  /** Current form values */
  values: Partial<TValues>;
  /** Field errors */
  errors: FieldErrors<TValues>;
  /** Touched fields */
  touched: Partial<Record<keyof TValues, boolean>>;
  /** Whether form is submitting */
  isSubmitting: boolean;
  /** Whether form is valid (no errors) */
  isValid: boolean;
  /** Whether any field has changed from initial */
  isDirty: boolean;

  /** Get value for a field */
  getValue: (key: keyof TValues) => FieldValue;
  /** Set value for a field */
  setValue: (key: keyof TValues, value: FieldValue) => void;
  /** Get error for a field */
  getError: (key: keyof TValues) => string | null;
  /** Set error for a field */
  setError: (key: keyof TValues, error: string | null) => void;
  /** Get touched state for a field */
  getTouched: (key: keyof TValues) => boolean;
  /** Set touched state for a field */
  setTouched: (key: keyof TValues, touched: boolean) => void;
  /** Get all values */
  getValues: () => Partial<TValues>;
  /** Set multiple values at once */
  setValues: (values: Partial<TValues>) => void;

  /** Validate entire form */
  validate: () => Promise<boolean>;
  /** Validate a single field */
  validateField: (key: keyof TValues) => Promise<string | null>;
  /** Reset form to default values */
  reset: () => void;

  /** Handle form submission */
  handleSubmit: (
    onSubmit: (values: TValues) => Promise<void> | void,
    onError?: (errors: FieldErrors<TValues>) => void,
  ) => (e: React.FormEvent) => Promise<void>;

  /** Context value for FormKitProvider */
  context: FormContextValue<TValues>;
}

/**
 * Master form state management hook
 * Powers DynamicForm internally - not typically used directly
 *
 * @param options - Form configuration options
 * @returns Form state and methods
 *
 * @example
 * ```tsx
 * const form = useFormKit({
 *   schema: z.object({ name: z.string().min(2) }),
 *   defaultValues: { name: '' },
 *   mode: 'onBlur',
 * });
 * ```
 */
export function useFormKit<TValues extends FormValues = FormValues>(
  options: UseFormKitOptions<TValues>,
): UseFormKitReturn<TValues> {
  const { schema, defaultValues } = options;

  // State
  const [values, setValuesState] = useState<Partial<TValues>>(defaultValues);
  const [errors, setErrors] = useState<FieldErrors<TValues>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof TValues, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Refs for stable callbacks
  const valuesRef = useRef(values);
  valuesRef.current = values;

  // Computed state
  const isValid = useMemo(() => Object.keys(errors).length === 0, [errors]);
  const isDirty = useMemo(() => {
    return Object.keys(values).some(
      (key) => values[key as keyof TValues] !== defaultValues[key as keyof TValues],
    );
  }, [values, defaultValues]);

  // Get single value
  const getValue = useCallback((key: keyof TValues): FieldValue => {
    return valuesRef.current[key];
  }, []);

  // Set single value
  const setValue = useCallback((key: keyof TValues, value: FieldValue) => {
    setValuesState((prev) => ({ ...prev, [key]: value }));
    // Clear error on change
    setErrors((prev) => {
      if (prev[key]) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return prev;
    });
  }, []);

  // Get error
  const getError = useCallback(
    (key: keyof TValues): string | null => {
      return errors[key] ?? null;
    },
    [errors],
  );

  // Set error
  const setError = useCallback((key: keyof TValues, error: string | null) => {
    setErrors((prev) => {
      if (error === null) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: error };
    });
  }, []);

  // Get touched
  const getIsTouched = useCallback(
    (key: keyof TValues): boolean => {
      return touched[key] ?? false;
    },
    [touched],
  );

  // Set touched
  const setIsTouched = useCallback((key: keyof TValues, isTouched: boolean) => {
    setTouched((prev) => ({ ...prev, [key]: isTouched }));
  }, []);

  // Get all values
  const getValues = useCallback((): Partial<TValues> => {
    return valuesRef.current;
  }, []);

  // Set multiple values
  const setValues = useCallback((newValues: Partial<TValues>) => {
    setValuesState((prev) => ({ ...prev, ...newValues }));
  }, []);

  // Validate entire form - returns errors for immediate use
  const validate = useCallback(async (): Promise<{
    isValid: boolean;
    errors: FieldErrors<TValues>;
  }> => {
    if (!schema) return { isValid: true, errors: {} };

    const result = schema.safeParse(valuesRef.current);
    if (result.success) {
      setErrors({});
      return { isValid: true, errors: {} };
    }

    const fieldErrors = mapZodErrors<TValues>(result.error);
    setErrors(fieldErrors);
    return { isValid: false, errors: fieldErrors };
  }, [schema]);

  // Validate single field
  const validateField = useCallback(
    async (key: keyof TValues): Promise<string | null> => {
      if (!schema) return null;

      // For per-field validation, we validate the whole form but only return the error for this field
      const result = schema.safeParse(valuesRef.current);
      if (result.success) {
        setError(key, null);
        return null;
      }

      const fieldErrors = mapZodErrors<TValues>(result.error);
      const error = fieldErrors[key] ?? null;
      setError(key, error);
      return error;
    },
    [schema, setError],
  );

  // Reset form
  const reset = useCallback(() => {
    setValuesState(defaultValues);
    setErrors({});
    setTouched({});
  }, [defaultValues]);

  // Handle submit
  const handleSubmit = useCallback(
    (
      onSubmit: (values: TValues) => Promise<void> | void,
      onError?: (errors: FieldErrors<TValues>) => void,
    ) => {
      return async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
          const { isValid, errors: validationErrors } = await validate();
          if (!isValid) {
            // Mark all fields with errors as touched so errors display
            const touchedFields: Partial<Record<keyof TValues, boolean>> = {};
            Object.keys(validationErrors).forEach((key) => {
              touchedFields[key as keyof TValues] = true;
            });
            setTouched((prev) => ({ ...prev, ...touchedFields }));
            onError?.(validationErrors);
            return;
          }

          await onSubmit(valuesRef.current as TValues);
        } finally {
          setIsSubmitting(false);
        }
      };
    },
    [validate],
  );

  // Context value for FormKitProvider
  const context = useMemo<FormContextValue<TValues>>(
    () => ({
      getValue,
      setValue,
      getError,
      setError,
      getTouched: getIsTouched,
      setTouched: setIsTouched,
      getValues,
      isSubmitting,
      isValid,
    }),
    [
      getValue,
      setValue,
      getError,
      setError,
      getIsTouched,
      setIsTouched,
      getValues,
      isSubmitting,
      isValid,
    ],
  );

  // Public validate that returns boolean for backward compatibility
  const validatePublic = useCallback(async (): Promise<boolean> => {
    const { isValid } = await validate();
    return isValid;
  }, [validate]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    isDirty,
    getValue,
    setValue,
    getError,
    setError,
    getTouched: getIsTouched,
    setTouched: setIsTouched,
    getValues,
    setValues,
    validate: validatePublic,
    validateField,
    reset,
    handleSubmit,
    context,
  };
}

/**
 * useForm hook for managing form state and validation
 */

import { useState, useCallback, useMemo, useRef } from 'react';
import type { FieldValue } from '../utils/types';

/**
 * Form field registration info
 */
export interface FieldRegistration {
  /** Field name */
  name: string;
  /** Get current field value */
  getValue: () => FieldValue;
  /** Set field value */
  setValue: (value: FieldValue) => void;
  /** Validate field */
  validate: () => Promise<string | null>;
  /** Reset field to initial state */
  reset: () => void;
  /** Set field error */
  setError: (error: string | null) => void;
  /** Set field touched state */
  setTouched: (touched: boolean) => void;
  /** Get field touched state */
  isTouched: () => boolean;
  /** Get field dirty state */
  isDirty: () => boolean;
}

/**
 * Form values type
 */
export type FormValues = Record<string, FieldValue>;

/**
 * Form field errors type (simple string map)
 */
export type FormFieldErrors = Record<string, string | null>;

/**
 * Form touched state type
 */
export type FormTouched = Record<string, boolean>;

/**
 * Form validation mode
 */
export type ValidationMode = 'onSubmit' | 'onBlur' | 'onChange' | 'onTouched' | 'all';

/**
 * Form-level validator function
 */
export type FormValidator = (values: FormValues) => FormFieldErrors | Promise<FormFieldErrors>;

/**
 * Configuration options for useForm hook
 */
export interface UseFormOptions<T extends FormValues = FormValues> {
  /** Initial form values */
  defaultValues?: Partial<T>;
  /** Validation mode */
  mode?: ValidationMode;
  /** Revalidation mode after submit */
  reValidateMode?: Exclude<ValidationMode, 'onSubmit'>;
  /** Form-level validators */
  validators?: FormValidator[];
  /** Should focus first error on submit */
  shouldFocusError?: boolean;
  /** Delay before validation (ms) */
  validationDelay?: number;
  /** Reset form after successful submit */
  resetOnSuccessfulSubmit?: boolean;
}

/**
 * Form state
 */
export interface FormState {
  /** Whether form is currently submitting */
  isSubmitting: boolean;
  /** Whether form has been submitted at least once */
  isSubmitted: boolean;
  /** Number of submit attempts */
  submitCount: number;
  /** Whether form is valid */
  isValid: boolean;
  /** Whether form is validating */
  isValidating: boolean;
  /** Whether any field is dirty */
  isDirty: boolean;
  /** Current form errors */
  errors: FormFieldErrors;
  /** Touched state for all fields */
  touched: FormTouched;
  /** Current form values */
  values: FormValues;
}

/**
 * Return type of useForm hook
 */
export interface UseFormReturn<T extends FormValues = FormValues> {
  /** Current form state */
  formState: FormState;
  /** Register a field with the form */
  register: (name: string, registration: FieldRegistration) => void;
  /** Unregister a field from the form */
  unregister: (name: string) => void;
  /** Get all form values */
  getValues: () => T;
  /** Get a single field value */
  getValue: <K extends keyof T>(name: K) => T[K];
  /** Set a single field value */
  setValue: <K extends keyof T>(
    name: K,
    value: T[K],
    options?: { shouldValidate?: boolean; shouldTouch?: boolean },
  ) => void;
  /** Set multiple field values */
  setValues: (values: Partial<T>, options?: { shouldValidate?: boolean }) => void;
  /** Set a field error */
  setError: (name: keyof T, error: string | null) => void;
  /** Clear a field error */
  clearError: (name: keyof T) => void;
  /** Clear all errors */
  clearErrors: () => void;
  /** Trigger validation for specific fields or all fields */
  trigger: (names?: (keyof T)[] | keyof T) => Promise<boolean>;
  /** Reset form to initial state */
  reset: (values?: Partial<T>) => void;
  /** Handle form submission */
  handleSubmit: (
    onValid: (data: T) => void | Promise<void>,
    onInvalid?: (errors: FormFieldErrors) => void,
  ) => (e?: React.FormEvent) => Promise<void>;
  /** Get props for the form element */
  formProps: {
    onSubmit: (e: React.FormEvent) => void;
    noValidate: boolean;
  };
}

/**
 * Hook for managing form state and validation
 * @param options - Form configuration options
 * @returns Form state and control methods
 */
export function useForm<T extends FormValues = FormValues>(
  options: UseFormOptions<T> = {},
): UseFormReturn<T> {
  const {
    defaultValues = {} as Partial<T>,
    // mode and reValidateMode reserved for future use
    // mode = 'onSubmit',
    // reValidateMode = 'onChange',
    validators = [],
    shouldFocusError = true,
    resetOnSuccessfulSubmit = false,
  } = options;

  // Field registrations
  const fieldsRef = useRef<Map<string, FieldRegistration>>(new Map());

  // Form state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);
  const [isValidating, setIsValidating] = useState(false);
  const [errors, setErrors] = useState<FormFieldErrors>({});
  const [touched, setTouched] = useState<FormTouched>({});
  const [values, setValues] = useState<FormValues>(defaultValues as FormValues);

  // Computed states
  const isValid = useMemo(() => Object.values(errors).every((e) => !e), [errors]);
  const isDirty = useMemo(() => {
    for (const field of fieldsRef.current.values()) {
      if (field.isDirty()) return true;
    }
    return false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values]);

  // Register a field
  const register = useCallback(
    (name: string, registration: FieldRegistration) => {
      fieldsRef.current.set(name, registration);
      // Set initial value if provided in defaultValues
      if (name in defaultValues) {
        registration.setValue(defaultValues[name as keyof T] as FieldValue);
      }
    },
    [defaultValues],
  );

  // Unregister a field
  const unregister = useCallback((name: string) => {
    fieldsRef.current.delete(name);
    setErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
    setTouched((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
    setValues((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  // Get all form values
  const getValues = useCallback((): T => {
    const result: FormValues = {};
    for (const [name, field] of fieldsRef.current) {
      result[name] = field.getValue();
    }
    return result as T;
  }, []);

  // Get a single field value
  const getValue = useCallback(<K extends keyof T>(name: K): T[K] => {
    const field = fieldsRef.current.get(name as string);
    return (field ? field.getValue() : undefined) as T[K];
  }, []);

  // Set a single field value
  const setValue = useCallback(
    <K extends keyof T>(
      name: K,
      value: T[K],
      opts: { shouldValidate?: boolean; shouldTouch?: boolean } = {},
    ) => {
      const field = fieldsRef.current.get(name as string);
      if (field) {
        field.setValue(value as FieldValue);
        setValues((prev) => ({ ...prev, [name]: value }));

        if (opts.shouldTouch) {
          field.setTouched(true);
          setTouched((prev) => ({ ...prev, [name]: true }));
        }

        if (opts.shouldValidate) {
          field.validate().then((error) => {
            setErrors((prev) => ({ ...prev, [name]: error }));
          });
        }
      }
    },
    [],
  );

  // Trigger validation
  const trigger = useCallback(
    async (names?: (keyof T)[] | keyof T): Promise<boolean> => {
      setIsValidating(true);

      const fieldsToValidate = names
        ? (Array.isArray(names) ? names : [names])
            .map((n) => fieldsRef.current.get(n as string))
            .filter(Boolean)
        : Array.from(fieldsRef.current.values());

      const validationResults = await Promise.all(
        fieldsToValidate.map(async (field) => {
          if (!field) return { name: '', error: null };
          const error = await field.validate();
          return { name: field.name, error };
        }),
      );

      // Run form-level validators
      const currentValues = getValues();
      const formLevelErrors: FormFieldErrors = {};

      for (const validator of validators) {
        const result = await validator(currentValues);
        Object.assign(formLevelErrors, result);
      }

      // Merge field and form-level errors
      const newErrors: FormFieldErrors = { ...errors };
      for (const { name, error } of validationResults) {
        if (name) {
          newErrors[name] = error ?? formLevelErrors[name] ?? null;
        }
      }

      // Add any remaining form-level errors for fields not validated
      for (const [name, error] of Object.entries(formLevelErrors)) {
        if (!(name in newErrors)) {
          newErrors[name] = error;
        }
      }

      setErrors(newErrors);
      setIsValidating(false);

      return Object.values(newErrors).every((e) => !e);
    },
    [errors, getValues, validators],
  );

  // Set multiple field values
  const setValuesMultiple = useCallback(
    (newValues: Partial<T>, opts: { shouldValidate?: boolean } = {}) => {
      for (const [name, value] of Object.entries(newValues)) {
        const field = fieldsRef.current.get(name);
        if (field) {
          field.setValue(value as FieldValue);
        }
      }
      setValues((prev) => ({ ...prev, ...newValues }));

      if (opts.shouldValidate) {
        trigger(Object.keys(newValues) as (keyof T)[]);
      }
    },
    [trigger],
  );

  // Set a field error
  const setError = useCallback((name: keyof T, error: string | null) => {
    const field = fieldsRef.current.get(name as string);
    if (field) {
      field.setError(error);
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
  }, []);

  // Clear a field error
  const clearError = useCallback(
    (name: keyof T) => {
      setError(name, null);
    },
    [setError],
  );

  // Clear all errors
  const clearErrors = useCallback(() => {
    for (const field of fieldsRef.current.values()) {
      field.setError(null);
    }
    setErrors({});
  }, []);

  // Reset form
  const reset = useCallback(
    (newValues?: Partial<T>) => {
      const resetValues = newValues ?? defaultValues;

      for (const field of fieldsRef.current.values()) {
        field.reset();
        if (field.name in resetValues) {
          field.setValue(resetValues[field.name as keyof T] as FieldValue);
        }
      }

      setValues(resetValues as FormValues);
      setErrors({});
      setTouched({});
      setIsSubmitted(false);
      setSubmitCount(0);
    },
    [defaultValues],
  );

  // Focus first error field
  const focusFirstError = useCallback(() => {
    if (!shouldFocusError) return;

    for (const [name] of fieldsRef.current) {
      if (errors[name]) {
        const element = document.querySelector(`[name="${name}"]`) as HTMLElement;
        if (element && typeof element.focus === 'function') {
          element.focus();
          break;
        }
      }
    }
  }, [errors, shouldFocusError]);

  // Handle form submission
  const handleSubmit = useCallback(
    (onValid: (data: T) => void | Promise<void>, onInvalid?: (errors: FormFieldErrors) => void) => {
      return async (e?: React.FormEvent) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }

        setIsSubmitting(true);
        setSubmitCount((prev) => prev + 1);

        // Touch all fields
        for (const field of fieldsRef.current.values()) {
          field.setTouched(true);
        }
        setTouched(
          Object.fromEntries(Array.from(fieldsRef.current.keys()).map((name) => [name, true])),
        );

        // Validate all fields
        const isFormValid = await trigger();

        setIsSubmitted(true);

        if (isFormValid) {
          try {
            await onValid(getValues());
            if (resetOnSuccessfulSubmit) {
              reset();
            }
          } catch (error) {
            // Allow onValid to throw and keep form in submitted state
            console.error('Form submission error:', error);
          }
        } else {
          focusFirstError();
          onInvalid?.(errors);
        }

        setIsSubmitting(false);
      };
    },
    [trigger, getValues, errors, reset, resetOnSuccessfulSubmit, focusFirstError],
  );

  // Form props for the form element
  const formProps = useMemo(
    () => ({
      onSubmit: handleSubmit(() => {}),
      noValidate: true,
    }),
    [handleSubmit],
  );

  // Form state object
  const formState: FormState = useMemo(
    () => ({
      isSubmitting,
      isSubmitted,
      submitCount,
      isValid,
      isValidating,
      isDirty,
      errors,
      touched,
      values,
    }),
    [
      isSubmitting,
      isSubmitted,
      submitCount,
      isValid,
      isValidating,
      isDirty,
      errors,
      touched,
      values,
    ],
  );

  return {
    formState,
    register,
    unregister,
    getValues,
    getValue,
    setValue,
    setValues: setValuesMultiple,
    setError,
    clearError,
    clearErrors,
    trigger,
    reset,
    handleSubmit,
    formProps,
  };
}

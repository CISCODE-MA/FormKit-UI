/**
 * FormState - Runtime form state shape
 * Type Layer — contracts only, zero runtime logic
 */

import type { FieldValue, FormValues } from '../core/types';

/**
 * State for a single field
 */
export interface FieldState {
  /** Current field value */
  readonly value: FieldValue;
  /** Error message (null if valid) */
  readonly error: string | null;
  /** Whether field has been touched (focused then blurred) */
  readonly touched: boolean;
  /** Whether field value differs from initial value */
  readonly dirty: boolean;
  /** Whether async validation is in progress */
  readonly isValidating: boolean;
}

/**
 * Complete form state managed by useFormKit
 */
export interface FormState<TValues extends FormValues = FormValues> {
  /** Current form values */
  readonly values: TValues;
  /** Field-level errors (field key → error message) */
  readonly errors: Partial<Record<keyof TValues, string>>;
  /** Which fields have been touched */
  readonly touched: Partial<Record<keyof TValues, boolean>>;
  /** Whether form is currently submitting */
  readonly isSubmitting: boolean;
  /** Whether form is valid (no errors) */
  readonly isValid: boolean;
  /** Whether any field value has changed from initial */
  readonly isDirty: boolean;
  /** Number of times form has been submitted */
  readonly submitCount: number;
}

/**
 * Form context value exposed to child components
 */
export interface FormContextValue<TValues extends FormValues = FormValues> {
  /** Get current value for a field */
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
  /** Get all form values (may be partial until submission) */
  getValues: () => Partial<TValues>;
  /** Whether form is submitting */
  isSubmitting: boolean;
  /** Whether form is valid */
  isValid: boolean;
}

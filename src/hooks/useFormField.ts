/**
 * useFormField hook for managing form field state
 */

import { useState, useCallback, useMemo } from 'react';
import type { FieldValue, FieldState } from '../utils/types';

/**
 * Configuration options for useFormField hook
 */
export interface UseFormFieldOptions {
  /** Initial field value */
  initialValue?: FieldValue;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Whether the field is read-only */
  readOnly?: boolean;
  /** Callback when value changes */
  onChange?: (value: FieldValue) => void;
  /** Callback when field is blurred */
  onBlur?: () => void;
  /** Callback when field is focused */
  onFocus?: () => void;
  /** Transform value before setting */
  transform?: (value: FieldValue) => FieldValue;
}

/**
 * Return type of useFormField hook
 */
export interface UseFormFieldReturn {
  /** Current field state */
  state: FieldState;
  /** Current field value */
  value: FieldValue;
  /** Set field value */
  setValue: (value: FieldValue) => void;
  /** Handle change event */
  handleChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => void;
  /** Handle blur event */
  handleBlur: () => void;
  /** Handle focus event */
  handleFocus: () => void;
  /** Reset field to initial state */
  reset: () => void;
  /** Set touched state */
  setTouched: (touched: boolean) => void;
  /** Whether field is dirty */
  isDirty: boolean;
  /** Whether field is pristine (not dirty) */
  isPristine: boolean;
  /** Whether field is touched */
  isTouched: boolean;
  /** Whether field is untouched */
  isUntouched: boolean;
}

/**
 * Hook for managing form field state
 * @param options - Field configuration options
 * @returns Field state and handlers
 */
export function useFormField(options: UseFormFieldOptions = {}): UseFormFieldReturn {
  const {
    initialValue = '',
    disabled = false,
    readOnly = false,
    onChange,
    onBlur,
    onFocus,
    transform,
  } = options;

  // Field state
  const [value, setValueState] = useState<FieldValue>(initialValue);
  const [touched, setTouched] = useState(false);
  const [initialVal] = useState(initialValue);

  // Computed state
  const isDirty = useMemo(() => value !== initialVal, [value, initialVal]);
  const isPristine = !isDirty;
  const isTouched = touched;
  const isUntouched = !touched;

  // Full field state object
  const state: FieldState = useMemo(
    () => ({
      value,
      touched,
      dirty: isDirty,
      disabled,
      readOnly,
    }),
    [value, touched, isDirty, disabled, readOnly],
  );

  // Set value with optional transform
  const setValue = useCallback(
    (newValue: FieldValue) => {
      const transformedValue = transform ? transform(newValue) : newValue;
      setValueState(transformedValue);
      onChange?.(transformedValue);
    },
    [transform, onChange],
  );

  // Handle change event from input elements
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      if (disabled || readOnly) {
        return;
      }

      const target = event.target as HTMLInputElement & HTMLTextAreaElement & HTMLSelectElement;
      let newValue: FieldValue;

      // Check if it's an input element by the presence of 'type' property
      if ('type' in target) {
        if (target.type === 'checkbox') {
          newValue = target.checked;
        } else if (target.type === 'number') {
          newValue = target.value === '' ? '' : Number(target.value);
        } else if (target.type === 'file') {
          newValue = target.multiple ? Array.from(target.files || []) : target.files?.[0] || null;
        } else {
          newValue = target.value;
        }
      } else {
        newValue = target.value;
      }

      setValue(newValue);
    },
    [disabled, readOnly, setValue],
  );

  // Handle blur event
  const handleBlur = useCallback(() => {
    if (!touched) {
      setTouched(true);
    }
    onBlur?.();
  }, [touched, onBlur]);

  // Handle focus event
  const handleFocus = useCallback(() => {
    onFocus?.();
  }, [onFocus]);

  // Reset field to initial state
  const reset = useCallback(() => {
    setValueState(initialVal);
    setTouched(false);
    onChange?.(initialVal);
  }, [initialVal, onChange]);

  return {
    state,
    value,
    setValue,
    handleChange,
    handleBlur,
    handleFocus,
    reset,
    setTouched,
    isDirty,
    isPristine,
    isTouched,
    isUntouched,
  };
}

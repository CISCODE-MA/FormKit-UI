/**
 * Checkbox component with validation and error handling
 */

import { forwardRef, useId, useEffect, useRef, useMemo } from 'react';
import type { ValidationRule } from '../validation/types';
import { useFormField } from '../hooks/useFormField';
import { useValidation } from '../hooks/useValidation';
import { useFieldError } from '../hooks/useFieldError';

/**
 * Props for Checkbox component
 */
export interface CheckboxProps {
  /** Checkbox name attribute */
  name: string;
  /** Checkbox label text (shown next to checkbox) */
  checkboxLabel?: string;
  /** Container label (optional, for grouping) */
  label?: string;
  /** Default checked state */
  defaultChecked?: boolean;
  /** Whether checkbox is in indeterminate state */
  indeterminate?: boolean;
  /** Whether field is required */
  required?: boolean;
  /** Whether field is disabled */
  disabled?: boolean;
  /** Whether field is read-only */
  readOnly?: boolean;
  /** Custom CSS class name for the container */
  className?: string;
  /** Custom CSS class name for the checkbox wrapper */
  checkboxClassName?: string;
  /** Validation rules */
  validationRules?: ValidationRule[];
  /** When to validate */
  validateOn?: 'change' | 'blur' | 'submit';
  /** Debounce validation (ms) */
  debounce?: number;
  /** Show error message */
  showError?: boolean;
  /** Auto-dismiss errors after delay (ms) */
  autoDismissError?: number;
  /** Hint or help text */
  hint?: string;
  /** Change handler */
  onChange?: (checked: boolean) => void;
  /** Blur handler */
  onBlur?: () => void;
  /** Focus handler */
  onFocus?: () => void;
  /** Validation change handler */
  onValidationChange?: (isValid: boolean) => void;
}

/**
 * Checkbox component with validation and error handling
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      name,
      checkboxLabel,
      label,
      defaultChecked = false,
      indeterminate = false,
      required = false,
      disabled = false,
      readOnly = false,
      className = '',
      checkboxClassName = '',
      validationRules = [],
      validateOn = 'change',
      debounce,
      showError = true,
      autoDismissError,
      hint,
      onChange,
      onBlur,
      onFocus,
      onValidationChange,
    },
    ref,
  ) => {
    const generatedId = useId();
    const fieldId = `checkbox-${name}-${generatedId}`;
    const errorId = `${fieldId}-error`;
    const hintId = hint ? `${fieldId}-hint` : undefined;

    const internalRef = useRef<HTMLInputElement | null>(null);

    // Add required validator if required prop is true
    const effectiveRules = useMemo(() => {
      if (required) {
        // Add a "must be checked" validator
        const checkedValidator: ValidationRule = {
          validator: (value: unknown) => {
            return value === true ? null : 'This field is required';
          },
        };
        return [checkedValidator, ...validationRules];
      }
      return validationRules;
    }, [required, validationRules]);

    // Field state management
    const { value, isTouched, handleChange, handleBlur, handleFocus } = useFormField({
      initialValue: defaultChecked,
      disabled,
      readOnly,
      onChange: (val) => {
        const checked = val as boolean;
        onChange?.(checked);
        if (validateOn === 'change') {
          validate(checked);
        }
      },
      onBlur: () => {
        onBlur?.();
        if (validateOn === 'blur') {
          validate(value as boolean);
        }
      },
      onFocus,
    });

    // Validation
    const { errors, isValid, validate } = useValidation({
      rules: effectiveRules,
      debounce,
    });

    // Notify parent of validation changes
    useEffect(() => {
      if (onValidationChange) {
        onValidationChange(isValid);
      }
    }, [isValid, onValidationChange]);

    // Error handling
    const { error, setErrors } = useFieldError({
      fieldName: name,
      autoDismiss: autoDismissError,
    });

    // Sync validation errors to field errors
    useEffect(() => {
      if (errors.length > 0) {
        setErrors(errors);
      } else if (error !== null) {
        setErrors([]);
      }
    }, [errors, error, setErrors]);

    // Handle indeterminate state
    useEffect(() => {
      if (internalRef.current) {
        internalRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);

    // Handle ref forwarding
    const setRefs = (element: HTMLInputElement | null) => {
      internalRef.current = element;
      if (typeof ref === 'function') {
        ref(element);
      } else if (ref) {
        ref.current = element;
      }
    };

    const hasError = isTouched && error !== null;
    const showHint = hint && !hasError;
    const checked = value as boolean;

    return (
      <div className={`formkit-checkbox-container ${className} mb-4`}>
        {label && (
          <div className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {required && <span className="text-red-500"> *</span>}
          </div>
        )}
        <div className={`formkit-checkbox-wrapper ${checkboxClassName} flex items-center gap-2`}>
          <input
            ref={setRefs}
            type="checkbox"
            id={fieldId}
            name={name}
            checked={checked}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            required={required}
            disabled={disabled}
            readOnly={readOnly}
            className={`formkit-checkbox h-4 w-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${hasError ? 'formkit-checkbox-error border-red-500' : ''} ${isTouched && isValid ? 'border-green-500' : ''}`}
            aria-invalid={hasError}
            aria-describedby={
              [hasError ? errorId : undefined, showHint ? hintId : undefined]
                .filter(Boolean)
                .join(' ') || undefined
            }
          />
          {checkboxLabel && (
            <label htmlFor={fieldId} className="text-sm text-gray-700">
              {checkboxLabel}
            </label>
          )}
        </div>
        {showHint && (
          <div id={hintId} className="text-xs text-gray-500 mt-1">
            {hint}
          </div>
        )}
        {showError && hasError && (
          <div id={errorId} className="text-xs text-red-600 mt-1" role="alert">
            {error}
          </div>
        )}
      </div>
    );
  },
);

Checkbox.displayName = 'Checkbox';

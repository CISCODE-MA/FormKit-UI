/**
 * Input component with validation and error handling
 */

import { forwardRef, useId, useEffect } from 'react';
import type { InputType } from '../utils/types';
import type { ValidationRule } from '../validation/types';
import { useFormField } from '../hooks/useFormField';
import { useValidation } from '../hooks/useValidation';
import { useFieldError } from '../hooks/useFieldError';

/**
 * Props for Input component
 */
export interface InputProps {
  /** Input name attribute */
  name: string;
  /** Input type */
  type?: InputType;
  /** Label text */
  label?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Default value */
  defaultValue?: string | number;
  /** Whether field is required */
  required?: boolean;
  /** Whether field is disabled */
  disabled?: boolean;
  /** Whether field is read-only */
  readOnly?: boolean;
  /** Custom CSS class name for the container */
  className?: string;
  /** Custom CSS class name for the input element */
  inputClassName?: string;
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
  /** Maximum length */
  maxLength?: number;
  /** Minimum value (for number type) */
  min?: number;
  /** Maximum value (for number type) */
  max?: number;
  /** Step value (for number type) */
  step?: number;
  /** Pattern for validation */
  pattern?: string;
  /** Autocomplete attribute */
  autoComplete?: string;
  /** Hint or help text */
  hint?: string;
  /** Change handler */
  onChange?: (value: string | number) => void;
  /** Blur handler */
  onBlur?: () => void;
  /** Focus handler */
  onFocus?: () => void;
  /** Validation change handler */
  onValidationChange?: (isValid: boolean) => void;
}

/**
 * Input component with validation and error handling
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      name,
      type = 'text',
      label,
      placeholder,
      defaultValue = '',
      required = false,
      disabled = false,
      readOnly = false,
      className = '',
      inputClassName = '',
      validationRules = [],
      validateOn = 'blur',
      debounce,
      showError = true,
      autoDismissError,
      maxLength,
      min,
      max,
      step,
      pattern,
      autoComplete,
      hint,
      onChange,
      onBlur,
      onFocus,
      onValidationChange,
    },
    ref,
  ) => {
    const generatedId = useId();
    const fieldId = `input-${name}-${generatedId}`;
    const errorId = `${fieldId}-error`;
    const hintId = hint ? `${fieldId}-hint` : undefined;

    // Field state management
    const { value, isTouched, handleChange, handleBlur, handleFocus } = useFormField({
      initialValue: defaultValue,
      disabled,
      readOnly,
      onChange: (val) => {
        onChange?.(val as string | number);
        if (validateOn === 'change') {
          validate(val as string | number);
        }
      },
      onBlur: () => {
        onBlur?.();
        if (validateOn === 'blur') {
          validate(value as string | number);
        }
      },
      onFocus,
    });

    // Validation
    const { errors, isValid, validate } = useValidation({
      rules: validationRules,
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
    if (errors.length > 0 && error !== errors[0]) {
      setErrors(errors);
    } else if (errors.length === 0 && error !== null) {
      setErrors([]);
    }

    const hasError = isTouched && error !== null;
    const showHint = hint && !hasError;

    return (
      <div className={`formkit-input-container ${className} mb-4`}>
        {label ? (
          <label htmlFor={fieldId} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {required && <span className="text-red-500"> *</span>}
          </label>
        ) : (
          <label htmlFor={fieldId} className="sr-only">
            {name}
            {required && <span className="text-red-500"> *</span>}
          </label>
        )}
        <input
          ref={ref}
          id={fieldId}
          name={name}
          type={type}
          value={value as string | number}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          readOnly={readOnly}
          maxLength={maxLength}
          min={min}
          max={max}
          step={step}
          pattern={pattern}
          autoComplete={autoComplete}
          className={`formkit-input ${inputClassName} w-full px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${hasError ? 'formkit-input-error border-red-500' : ''} ${isTouched && isValid ? 'border-green-500' : ''}`}
          aria-invalid={hasError}
          aria-describedby={
            [hasError ? errorId : undefined, showHint ? hintId : undefined]
              .filter(Boolean)
              .join(' ') || undefined
          }
        />
        {showHint && (
          <div id={hintId} className="text-xs text-gray-500 mt-1">
            {hint}
          </div>
        )}
        {showError && hasError && (
          <div id={errorId} className="text-xs text-red-600 mt-1" role="alert" aria-live="polite">
            {error}
          </div>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

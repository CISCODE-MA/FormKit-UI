/**
 * Select component with validation and error handling
 */

import { forwardRef, useId, useEffect } from 'react';
import type { ValidationRule } from '../validation/types';
import { useFormField } from '../hooks/useFormField';
import { useValidation } from '../hooks/useValidation';
import { useFieldError } from '../hooks/useFieldError';

/**
 * Option for select dropdown
 */
export interface SelectOption {
  /** Option value */
  value: string | number;
  /** Option display label */
  label: string;
  /** Whether option is disabled */
  disabled?: boolean;
}

/**
 * Props for Select component
 */
export interface SelectProps {
  /** Select name attribute */
  name: string;
  /** Available options */
  options: SelectOption[];
  /** Label text */
  label?: string;
  /** Placeholder for empty selection */
  placeholder?: string;
  /** Empty option label (overrides placeholder) */
  emptyLabel?: string;
  /** Default value */
  defaultValue?: string | number | string[] | number[];
  /** Allow multiple selections */
  multiple?: boolean;
  /** Whether field is required */
  required?: boolean;
  /** Whether field is disabled */
  disabled?: boolean;
  /** Whether field is read-only */
  readOnly?: boolean;
  /** Custom CSS class name for the container */
  className?: string;
  /** Custom CSS class name for the select element */
  selectClassName?: string;
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
  onChange?: (value: string | number | string[] | number[]) => void;
  /** Blur handler */
  onBlur?: () => void;
  /** Focus handler */
  onFocus?: () => void;
  /** Validation change handler */
  onValidationChange?: (isValid: boolean) => void;
}

/**
 * Select component with validation and error handling
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      name,
      options,
      label,
      placeholder,
      emptyLabel,
      defaultValue = '',
      multiple = false,
      required = false,
      disabled = false,
      readOnly = false,
      className = '',
      selectClassName = '',
      validationRules = [],
      validateOn = 'blur',
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
    const fieldId = `select-${name}-${generatedId}`;
    const errorId = `${fieldId}-error`;
    const hintId = hint ? `${fieldId}-hint` : undefined;

    // Field state management
    const { value, isTouched, setValue, handleBlur, handleFocus } = useFormField({
      initialValue: defaultValue,
      disabled,
      readOnly,
      onBlur: () => {
        onBlur?.();
        if (validateOn === 'blur') {
          validate(value as string | number | string[] | number[]);
        }
      },
      onFocus,
    });

    // Custom handleChange for select to support multiple selections
    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      if (disabled || readOnly) {
        return;
      }

      let newValue: string | number | string[] | number[];

      if (multiple) {
        // For multiple select, extract all selected values
        const selectedOptions = Array.from(event.target.selectedOptions);
        newValue = selectedOptions.map((option) => option.value);
      } else {
        // For single select, use the value directly
        newValue = event.target.value;
      }

      setValue(newValue);
      onChange?.(newValue);

      if (validateOn === 'change') {
        validate(newValue);
      }
    };

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
    useEffect(() => {
      if (errors.length > 0) {
        setErrors(errors);
      } else if (error !== null) {
        setErrors([]);
      }
    }, [errors, error, setErrors]);

    const hasError = isTouched && error !== null;
    const showHint = hint && !hasError;
    const showEmptyOption = !multiple && (emptyLabel || placeholder);
    const emptyOptionLabel = emptyLabel || placeholder || 'Select an option';

    // Convert value to appropriate type for select element
    const selectValue = multiple
      ? Array.isArray(value)
        ? value.map((v) => String(v))
        : []
      : (value as string | number);

    return (
      <div className={`formkit-select-container ${className} mb-4`}>
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
        <select
          ref={ref}
          id={fieldId}
          name={name}
          value={selectValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          required={required}
          disabled={disabled}
          multiple={multiple}
          className={`formkit-select ${selectClassName} w-full px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${hasError ? 'formkit-select-error border-red-500' : ''} ${isTouched && isValid ? 'border-green-500' : ''}`}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : showHint ? hintId : undefined}
        >
          {showEmptyOption && (
            <option value="" disabled={required}>
              {emptyOptionLabel}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
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

Select.displayName = 'Select';

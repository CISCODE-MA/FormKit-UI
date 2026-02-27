/**
 * NumberInput component with increment/decrement buttons and formatting
 */

import { forwardRef, useId, useEffect, useState, useCallback, useRef } from 'react';
import type { ValidationRule } from '../validation/types';
import { useFormField } from '../hooks/useFormField';
import { useValidation } from '../hooks/useValidation';
import { useFieldError } from '../hooks/useFieldError';

/**
 * Number formatting options
 */
export interface NumberFormatOptions {
  /** Decimal separator (default: '.') */
  decimalSeparator?: string;
  /** Thousands separator (default: ',') */
  thousandsSeparator?: string;
  /** Number of decimal places */
  decimalPlaces?: number;
  /** Prefix (e.g., '$') */
  prefix?: string;
  /** Suffix (e.g., '%') */
  suffix?: string;
}

/**
 * Props for NumberInput component
 */
export interface NumberInputProps {
  /** Input name attribute */
  name: string;
  /** Label text */
  label?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Default value */
  defaultValue?: number;
  /** Minimum value */
  min?: number;
  /** Maximum value */
  max?: number;
  /** Step increment (default: 1) */
  step?: number;
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
  /** Hint or help text */
  hint?: string;
  /** Show increment/decrement buttons */
  showButtons?: boolean;
  /** Button position */
  buttonPosition?: 'sides' | 'right';
  /** Number formatting options */
  format?: NumberFormatOptions;
  /** Allow negative numbers */
  allowNegative?: boolean;
  /** Allow decimals */
  allowDecimals?: boolean;
  /** Change handler */
  onChange?: (value: number | null) => void;
  /** Blur handler */
  onBlur?: () => void;
  /** Focus handler */
  onFocus?: () => void;
  /** Validation change handler */
  onValidationChange?: (isValid: boolean) => void;
}

/**
 * Format a number with the given options
 */
export function formatNumber(value: number | null, options: NumberFormatOptions = {}): string {
  if (value === null || isNaN(value)) return '';

  const {
    decimalSeparator = '.',
    thousandsSeparator = ',',
    decimalPlaces,
    prefix = '',
    suffix = '',
  } = options;

  let numStr: string;
  if (decimalPlaces !== undefined) {
    numStr = value.toFixed(decimalPlaces);
  } else {
    numStr = String(value);
  }

  // Split into integer and decimal parts
  const [intPart, decPart] = numStr.split('.');

  // Add thousands separator
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);

  // Combine with decimal
  const formatted = decPart ? `${formattedInt}${decimalSeparator}${decPart}` : formattedInt;

  return `${prefix}${formatted}${suffix}`;
}

/**
 * Parse a formatted string back to a number
 */
export function parseFormattedNumber(
  value: string,
  options: NumberFormatOptions = {},
): number | null {
  if (!value || value.trim() === '') return null;

  const { decimalSeparator = '.', thousandsSeparator = ',', prefix = '', suffix = '' } = options;

  // Remove prefix and suffix
  let cleaned = value;
  if (prefix && cleaned.startsWith(prefix)) {
    cleaned = cleaned.slice(prefix.length);
  }
  if (suffix && cleaned.endsWith(suffix)) {
    cleaned = cleaned.slice(0, -suffix.length);
  }

  // Remove thousands separators
  cleaned = cleaned.split(thousandsSeparator).join('');

  // Replace decimal separator with standard dot
  if (decimalSeparator !== '.') {
    cleaned = cleaned.replace(decimalSeparator, '.');
  }

  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Clamp a value between min and max
 */
function clamp(value: number, min?: number, max?: number): number {
  if (min !== undefined && value < min) return min;
  if (max !== undefined && value > max) return max;
  return value;
}

/**
 * Plus icon for increment button
 */
function PlusIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}

/**
 * Minus icon for decrement button
 */
function MinusIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
    </svg>
  );
}

/**
 * NumberInput component with increment/decrement buttons and formatting
 */
export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      name,
      label,
      placeholder,
      defaultValue,
      min,
      max,
      step = 1,
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
      hint,
      showButtons = true,
      buttonPosition = 'right',
      format,
      allowNegative = true,
      allowDecimals = true,
      onChange,
      onBlur,
      onFocus,
      onValidationChange,
    },
    ref,
  ) => {
    const generatedId = useId();
    const fieldId = `number-${name}-${generatedId}`;
    const errorId = `${fieldId}-error`;
    const hintId = hint ? `${fieldId}-hint` : undefined;

    // Internal ref for input
    const inputRef = useRef<HTMLInputElement>(null);

    // Store numeric value
    const [numericValue, setNumericValue] = useState<number | null>(defaultValue ?? null);

    // Store display value (formatted string)
    const [displayValue, setDisplayValue] = useState<string>(() =>
      defaultValue !== undefined && format
        ? formatNumber(defaultValue, format)
        : String(defaultValue ?? ''),
    );

    // Field state management
    const {
      isTouched,
      handleBlur: fieldBlur,
      handleFocus,
    } = useFormField({
      initialValue: displayValue,
      disabled,
      readOnly,
      onBlur: () => {
        onBlur?.();
        // Format on blur
        if (format && numericValue !== null) {
          setDisplayValue(formatNumber(numericValue, format));
        }
        if (validateOn === 'blur') {
          validate(String(numericValue ?? ''));
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

    // Handle input change
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        setDisplayValue(rawValue);

        // Parse the value
        const parsed = format ? parseFormattedNumber(rawValue, format) : parseFloat(rawValue);

        // Validate characters
        if (rawValue !== '') {
          // Allow negative sign at start
          const negativeOk = allowNegative || !rawValue.startsWith('-');
          // Allow decimal point if decimals allowed
          const decimalOk = allowDecimals || !rawValue.includes('.');

          if (!negativeOk || !decimalOk) {
            return;
          }
        }

        if (parsed !== null && !isNaN(parsed)) {
          setNumericValue(parsed);
          onChange?.(parsed);
          if (validateOn === 'change') {
            validate(String(parsed));
          }
        } else if (rawValue === '' || rawValue === '-') {
          setNumericValue(null);
          onChange?.(null);
          if (validateOn === 'change') {
            validate('');
          }
        }
      },
      [format, allowNegative, allowDecimals, onChange, validateOn, validate],
    );

    // Handle blur to format and clamp
    const handleBlur = useCallback(() => {
      if (numericValue !== null) {
        const clamped = clamp(numericValue, min, max);
        if (clamped !== numericValue) {
          setNumericValue(clamped);
          onChange?.(clamped);
        }
        if (format) {
          setDisplayValue(formatNumber(clamped, format));
        } else {
          setDisplayValue(String(clamped));
        }
      }
      fieldBlur();
    }, [numericValue, min, max, format, onChange, fieldBlur]);

    // Increment value
    const increment = useCallback(() => {
      if (disabled || readOnly) return;
      const current = numericValue ?? min ?? 0;
      const newValue = clamp(current + step, min, max);
      setNumericValue(newValue);
      setDisplayValue(format ? formatNumber(newValue, format) : String(newValue));
      onChange?.(newValue);
      if (validateOn === 'change') {
        validate(String(newValue));
      }
    }, [numericValue, min, max, step, disabled, readOnly, format, onChange, validateOn, validate]);

    // Decrement value
    const decrement = useCallback(() => {
      if (disabled || readOnly) return;
      const current = numericValue ?? max ?? 0;
      const newValue = clamp(current - step, min, max);
      setNumericValue(newValue);
      setDisplayValue(format ? formatNumber(newValue, format) : String(newValue));
      onChange?.(newValue);
      if (validateOn === 'change') {
        validate(String(newValue));
      }
    }, [numericValue, min, max, step, disabled, readOnly, format, onChange, validateOn, validate]);

    // Handle keyboard events
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          increment();
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          decrement();
        }
      },
      [increment, decrement],
    );

    const hasError = isTouched && error !== null;
    const showHint = hint && !hasError;

    // Button styles
    const buttonBaseClass =
      'flex items-center justify-center h-full px-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:text-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors';

    // Input padding based on button position
    const inputPaddingClass =
      showButtons && buttonPosition === 'sides'
        ? 'px-10'
        : showButtons && buttonPosition === 'right'
          ? 'pr-16'
          : '';

    return (
      <div className={`formkit-number-container ${className} mb-4`}>
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
        <div className="relative flex items-stretch">
          {showButtons && buttonPosition === 'sides' && (
            <button
              type="button"
              onClick={decrement}
              disabled={
                disabled || (min !== undefined && numericValue !== null && numericValue <= min)
              }
              className={`${buttonBaseClass} absolute left-0 border-r border-gray-300 rounded-l`}
              aria-label="Decrease value"
              tabIndex={-1}
            >
              <MinusIcon className="h-4 w-4" />
            </button>
          )}
          <input
            ref={(node) => {
              // Handle both refs
              (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
              if (typeof ref === 'function') {
                ref(node);
              } else if (ref) {
                ref.current = node;
              }
            }}
            id={fieldId}
            name={name}
            type="text"
            inputMode="decimal"
            value={displayValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            readOnly={readOnly}
            className={`formkit-number-input ${inputClassName} ${inputPaddingClass} w-full px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded transition-all duration-150 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed disabled:hover:border-gray-300 ${hasError ? 'formkit-number-error border-red-500 focus:ring-red-500 focus:border-red-500 hover:border-red-400' : ''} ${isTouched && isValid ? 'border-green-500 focus:ring-green-500 focus:border-green-500 hover:border-green-400' : ''}`}
            aria-invalid={hasError}
            aria-describedby={
              [hasError ? errorId : undefined, showHint ? hintId : undefined]
                .filter(Boolean)
                .join(' ') || undefined
            }
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={numericValue ?? undefined}
          />
          {showButtons && buttonPosition === 'sides' && (
            <button
              type="button"
              onClick={increment}
              disabled={
                disabled || (max !== undefined && numericValue !== null && numericValue >= max)
              }
              className={`${buttonBaseClass} absolute right-0 border-l border-gray-300 rounded-r`}
              aria-label="Increase value"
              tabIndex={-1}
            >
              <PlusIcon className="h-4 w-4" />
            </button>
          )}
          {showButtons && buttonPosition === 'right' && (
            <div className="absolute right-0 top-0 bottom-0 flex flex-col border-l border-gray-300">
              <button
                type="button"
                onClick={increment}
                disabled={
                  disabled || (max !== undefined && numericValue !== null && numericValue >= max)
                }
                className={`${buttonBaseClass} flex-1 border-b border-gray-300 rounded-tr px-1.5`}
                aria-label="Increase value"
                tabIndex={-1}
              >
                <svg
                  className="h-3 w-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 15l7-7 7 7"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={decrement}
                disabled={
                  disabled || (min !== undefined && numericValue !== null && numericValue <= min)
                }
                className={`${buttonBaseClass} flex-1 rounded-br px-1.5`}
                aria-label="Decrease value"
                tabIndex={-1}
              >
                <svg
                  className="h-3 w-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
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

NumberInput.displayName = 'NumberInput';

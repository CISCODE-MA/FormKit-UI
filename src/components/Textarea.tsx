/**
 * Textarea component with validation and error handling
 */

import { forwardRef, useId, useEffect, useRef, useState } from 'react';
import type { ValidationRule } from '../validation/types';
import { useFormField } from '../hooks/useFormField';
import { useValidation } from '../hooks/useValidation';
import { useFieldError } from '../hooks/useFieldError';

/**
 * Props for Textarea component
 */
export interface TextareaProps {
  /** Textarea name attribute */
  name: string;
  /** Label text */
  label?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Default value */
  defaultValue?: string;
  /** Whether field is required */
  required?: boolean;
  /** Whether field is disabled */
  disabled?: boolean;
  /** Whether field is read-only */
  readOnly?: boolean;
  /** Custom CSS class name for the container */
  className?: string;
  /** Custom CSS class name for the textarea element */
  textareaClassName?: string;
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
  /** Number of visible text rows */
  rows?: number;
  /** Number of visible text columns */
  cols?: number;
  /** Maximum length */
  maxLength?: number;
  /** Whether to auto-resize based on content */
  autoResize?: boolean;
  /** Show character count */
  showCount?: boolean;
  /** Hint or help text */
  hint?: string;
  /** Change handler */
  onChange?: (value: string) => void;
  /** Blur handler */
  onBlur?: () => void;
  /** Focus handler */
  onFocus?: () => void;
  /** Validation change handler */
  onValidationChange?: (isValid: boolean) => void;
}

/**
 * Textarea component with validation and error handling
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      name,
      label,
      placeholder,
      defaultValue = '',
      required = false,
      disabled = false,
      readOnly = false,
      className = '',
      textareaClassName = '',
      validationRules = [],
      validateOn = 'blur',
      debounce,
      showError = true,
      autoDismissError,
      rows = 3,
      cols,
      maxLength,
      autoResize = false,
      showCount = false,
      hint,
      onChange,
      onBlur,
      onFocus,
      onValidationChange,
    },
    ref,
  ) => {
    const generatedId = useId();
    const fieldId = `textarea-${name}-${generatedId}`;
    const errorId = `${fieldId}-error`;
    const hintId = hint ? `${fieldId}-hint` : undefined;
    const countId = showCount ? `${fieldId}-count` : undefined;

    const internalRef = useRef<HTMLTextAreaElement | null>(null);
    const [charCount, setCharCount] = useState(defaultValue.length);

    // Field state management
    const { value, isTouched, handleChange, handleBlur, handleFocus } = useFormField({
      initialValue: defaultValue,
      disabled,
      readOnly,
      onChange: (val) => {
        const strValue = val as string;
        setCharCount(strValue.length);
        onChange?.(strValue);
        if (validateOn === 'change') {
          validate(strValue);
        }
        if (autoResize && internalRef.current) {
          adjustHeight(internalRef.current);
        }
      },
      onBlur: () => {
        onBlur?.();
        if (validateOn === 'blur') {
          validate(value as string);
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
    useEffect(() => {
      if (errors.length > 0) {
        setErrors(errors);
      } else if (error !== null) {
        setErrors([]);
      }
    }, [errors, error, setErrors]);

    // Auto-resize functionality
    const adjustHeight = (element: HTMLTextAreaElement) => {
      element.style.height = 'auto';
      element.style.height = `${element.scrollHeight}px`;
    };

    // Setup auto-resize on mount
    useEffect(() => {
      if (autoResize && internalRef.current) {
        adjustHeight(internalRef.current);
      }
    }, [autoResize]);

    // Handle ref forwarding
    const setRefs = (element: HTMLTextAreaElement | null) => {
      internalRef.current = element;
      if (typeof ref === 'function') {
        ref(element);
      } else if (ref) {
        ref.current = element;
      }
    };

    const hasError = isTouched && error !== null;
    const showHint = hint && !hasError;
    const showCounter = showCount && (maxLength !== undefined || charCount > 0);
    const isOverLimit = maxLength !== undefined && charCount > maxLength;

    return (
      <div className={`formkit-textarea-container ${className} mb-4`}>
        {label && (
          <label htmlFor={fieldId} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {required && <span className="text-red-500"> *</span>}
          </label>
        )}
        <textarea
          ref={setRefs}
          id={fieldId}
          name={name}
          value={value as string}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          readOnly={readOnly}
          rows={rows}
          cols={cols}
          maxLength={maxLength}
          className={`formkit-textarea ${textareaClassName} w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${hasError ? 'formkit-textarea-error border-red-500' : ''} ${isTouched && isValid ? 'border-green-500' : ''} ${autoResize ? 'formkit-textarea-auto-resize resize-none' : ''}`}
          aria-invalid={hasError}
          aria-describedby={
            [
              hasError ? errorId : undefined,
              showHint ? hintId : undefined,
              showCounter ? countId : undefined,
            ]
              .filter(Boolean)
              .join(' ') || undefined
          }
        />
        {showHint && (
          <div id={hintId} className="text-xs text-gray-500 mt-1">
            {hint}
          </div>
        )}
        {showCounter && (
          <div
            id={countId}
            className={`text-xs text-gray-500 mt-1${isOverLimit ? ' text-red-600 formkit-textarea-count-over' : ''}`}
          >
            {charCount}
            {maxLength !== undefined && ` / ${maxLength}`}
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

Textarea.displayName = 'Textarea';

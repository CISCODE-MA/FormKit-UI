/**
 * PasswordInput component with visibility toggle and strength meter
 */

import { forwardRef, useId, useEffect, useState, useCallback, useMemo } from 'react';
import type { ValidationRule } from '../validation/types';
import { useFormField } from '../hooks/useFormField';
import { useValidation } from '../hooks/useValidation';
import { useFieldError } from '../hooks/useFieldError';

/**
 * Password strength levels
 */
export type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong';

/**
 * Password strength result
 */
export interface PasswordStrengthResult {
  /** Strength level */
  strength: PasswordStrength;
  /** Numeric score (0-100) */
  score: number;
  /** Feedback suggestions */
  feedback: string[];
}

/**
 * Props for PasswordInput component
 */
export interface PasswordInputProps {
  /** Input name attribute */
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
  /** Autocomplete attribute */
  autoComplete?: 'current-password' | 'new-password' | 'off';
  /** Hint or help text */
  hint?: string;
  /** Show password visibility toggle */
  showToggle?: boolean;
  /** Show password strength meter */
  showStrengthMeter?: boolean;
  /** Custom strength calculator */
  strengthCalculator?: (password: string) => PasswordStrengthResult;
  /** Change handler */
  onChange?: (value: string) => void;
  /** Blur handler */
  onBlur?: () => void;
  /** Focus handler */
  onFocus?: () => void;
  /** Validation change handler */
  onValidationChange?: (isValid: boolean) => void;
  /** Strength change handler */
  onStrengthChange?: (result: PasswordStrengthResult) => void;
}

/**
 * Default password strength calculator
 */
function calculatePasswordStrength(password: string): PasswordStrengthResult {
  const feedback: string[] = [];
  let score = 0;

  if (!password || password.length === 0) {
    return { strength: 'weak', score: 0, feedback: ['Enter a password'] };
  }

  // Length checks
  if (password.length >= 8) {
    score += 20;
  } else {
    feedback.push('Use at least 8 characters');
  }

  if (password.length >= 12) {
    score += 10;
  }

  if (password.length >= 16) {
    score += 10;
  }

  // Character variety checks
  if (/[a-z]/.test(password)) {
    score += 10;
  } else {
    feedback.push('Add lowercase letters');
  }

  if (/[A-Z]/.test(password)) {
    score += 15;
  } else {
    feedback.push('Add uppercase letters');
  }

  if (/[0-9]/.test(password)) {
    score += 15;
  } else {
    feedback.push('Add numbers');
  }

  if (/[^a-zA-Z0-9]/.test(password)) {
    score += 20;
  } else {
    feedback.push('Add special characters');
  }

  // Determine strength level
  let strength: PasswordStrength;
  if (score < 30) {
    strength = 'weak';
  } else if (score < 50) {
    strength = 'fair';
  } else if (score < 75) {
    strength = 'good';
  } else {
    strength = 'strong';
  }

  return { strength, score: Math.min(score, 100), feedback };
}

/**
 * Eye icon for showing password
 */
function EyeIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  );
}

/**
 * Eye-off icon for hiding password
 */
function EyeOffIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
      />
    </svg>
  );
}

/**
 * Strength meter component
 */
function StrengthMeter({ result }: { result: PasswordStrengthResult }) {
  const { strength, score } = result;

  const colorClasses: Record<PasswordStrength, string> = {
    weak: 'bg-red-500',
    fair: 'bg-yellow-500',
    good: 'bg-blue-500',
    strong: 'bg-green-500',
  };

  const labels: Record<PasswordStrength, string> = {
    weak: 'Weak',
    fair: 'Fair',
    good: 'Good',
    strong: 'Strong',
  };

  return (
    <div className="formkit-password-strength mt-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${colorClasses[strength]}`}
            style={{ width: `${score}%` }}
            role="progressbar"
            aria-valuenow={score}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Password strength: ${labels[strength]}`}
          />
        </div>
        <span
          className={`text-xs font-medium min-w-[50px] ${
            strength === 'weak'
              ? 'text-red-600'
              : strength === 'fair'
                ? 'text-yellow-600'
                : strength === 'good'
                  ? 'text-blue-600'
                  : 'text-green-600'
          }`}
        >
          {labels[strength]}
        </span>
      </div>
    </div>
  );
}

/**
 * PasswordInput component with visibility toggle and strength meter
 */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
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
      inputClassName = '',
      validationRules = [],
      validateOn = 'blur',
      debounce,
      showError = true,
      autoDismissError,
      maxLength,
      autoComplete = 'current-password',
      hint,
      showToggle = true,
      showStrengthMeter = false,
      strengthCalculator = calculatePasswordStrength,
      onChange,
      onBlur,
      onFocus,
      onValidationChange,
      onStrengthChange,
    },
    ref,
  ) => {
    const generatedId = useId();
    const fieldId = `password-${name}-${generatedId}`;
    const errorId = `${fieldId}-error`;
    const hintId = hint ? `${fieldId}-hint` : undefined;

    // Visibility state
    const [isVisible, setIsVisible] = useState(false);

    // Toggle visibility
    const toggleVisibility = useCallback(() => {
      setIsVisible((prev) => !prev);
    }, []);

    // Field state management
    const { value, isTouched, handleChange, handleBlur, handleFocus } = useFormField({
      initialValue: defaultValue,
      disabled,
      readOnly,
      onChange: (val) => {
        onChange?.(val as string);
        if (validateOn === 'change') {
          validate(val as string);
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

    // Password strength
    const strengthResult = useMemo(() => {
      if (!showStrengthMeter) {
        return { strength: 'weak' as PasswordStrength, score: 0, feedback: [] };
      }
      return strengthCalculator(value as string);
    }, [value, showStrengthMeter, strengthCalculator]);

    // Notify parent of strength changes
    useEffect(() => {
      if (showStrengthMeter && onStrengthChange) {
        onStrengthChange(strengthResult);
      }
    }, [strengthResult, showStrengthMeter, onStrengthChange]);

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
      <div className={`formkit-password-container ${className} mb-4`}>
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
        <div className="relative">
          <input
            ref={ref}
            id={fieldId}
            name={name}
            type={isVisible ? 'text' : 'password'}
            value={value as string}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            readOnly={readOnly}
            maxLength={maxLength}
            autoComplete={autoComplete}
            className={`formkit-password-input ${inputClassName} w-full px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded transition-all duration-150 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed disabled:hover:border-gray-300 ${showToggle ? 'pr-10' : ''} ${hasError ? 'formkit-password-error border-red-500 focus:ring-red-500 focus:border-red-500 hover:border-red-400' : ''} ${isTouched && isValid ? 'border-green-500 focus:ring-green-500 focus:border-green-500 hover:border-green-400' : ''}`}
            aria-invalid={hasError}
            aria-describedby={
              [hasError ? errorId : undefined, showHint ? hintId : undefined]
                .filter(Boolean)
                .join(' ') || undefined
            }
          />
          {showToggle && !disabled && (
            <button
              type="button"
              onClick={toggleVisibility}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 focus:outline-none focus:text-blue-500 transition-colors"
              aria-label={isVisible ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              {isVisible ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
          )}
        </div>
        {showStrengthMeter && (value as string).length > 0 && (
          <StrengthMeter result={strengthResult} />
        )}
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

PasswordInput.displayName = 'PasswordInput';

export { calculatePasswordStrength };

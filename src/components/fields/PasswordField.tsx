/**
 * PasswordField - Password input with show/hide toggle
 */

import { useState, type JSX } from 'react';
import type { FieldConfig } from '../../models/FieldConfig';
import { useFormKitContext } from '../context/FormKitContext';
import FieldLabel from '../layout/FieldLabel';
import FieldError from '../layout/FieldError';

/**
 * Props for PasswordField
 */
type Props = {
  config: FieldConfig;
};

/**
 * PasswordField component with visibility toggle
 * Follows WCAG 2.1 AA accessibility requirements
 */
export default function PasswordField({ config }: Props): JSX.Element {
  const { getValue, setValue, getError, getTouched, setTouched, getValues } = useFormKitContext();
  const [showPassword, setShowPassword] = useState(false);

  const fieldId = `field-${config.key}`;
  const errorId = `${fieldId}-error`;
  const descId = `${fieldId}-desc`;
  const toggleId = `${fieldId}-toggle`;

  const value = getValue(config.key);
  const error = getError(config.key);
  const touched = getTouched(config.key);
  const showError = touched && !!error;
  const showSuccess = touched && !error && !!value;

  // Compute disabled state
  const isDisabled =
    typeof config.disabled === 'function' ? config.disabled(getValues()) : config.disabled;

  // Build aria-describedby
  const describedBy =
    [showError ? errorId : null, config.description ? descId : null].filter(Boolean).join(' ') ||
    undefined;

  return (
    <div className="formkit-password-field flex flex-col gap-1 mb-4">
      <FieldLabel htmlFor={fieldId} label={config.label} required={config.required} />

      <div className="relative">
        <input
          id={fieldId}
          name={config.key}
          type={showPassword ? 'text' : 'password'}
          value={String(value ?? '')}
          placeholder={config.placeholder}
          disabled={isDisabled}
          readOnly={config.readOnly}
          aria-invalid={showError}
          aria-required={config.required}
          aria-describedby={describedBy}
          onChange={(e) => setValue(config.key, e.target.value)}
          onBlur={() => setTouched(config.key, true)}
          className={`
            formkit-input
            w-full px-3 py-2 sm:px-4 sm:py-2.5 pr-12
            text-sm sm:text-base
            border rounded-md
            transition-all duration-150
            focus:outline-none focus:ring-2 focus:border-blue-500
            ${
              showError
                ? 'border-red-500 focus:ring-red-500 focus:border-red-500 hover:border-red-400'
                : showSuccess
                  ? 'border-green-500 focus:ring-green-500 focus:border-green-500 hover:border-green-400'
                  : 'border-gray-300 focus:ring-blue-500 hover:border-gray-400'
            }
            ${
              isDisabled
                ? 'bg-gray-100 text-gray-500 cursor-not-allowed hover:border-gray-300'
                : 'bg-white'
            }
          `}
        />
        <button
          id={toggleId}
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          disabled={isDisabled}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          aria-pressed={showPassword}
          className={`
            absolute right-2 top-1/2 -translate-y-1/2
            p-1.5 rounded
            text-gray-500 hover:text-gray-700
            transition-colors duration-150
            ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
          `}
        >
          {showPassword ? (
            // Eye-off icon (hidden)
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
              />
            </svg>
          ) : (
            // Eye icon (showing)
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
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
          )}
        </button>
      </div>

      {config.description && !showError && (
        <p id={descId} className="text-xs text-gray-500 mt-1">
          {config.description}
        </p>
      )}

      {showError && <FieldError id={errorId} message={error} />}
    </div>
  );
}

export type { Props as PasswordFieldProps };

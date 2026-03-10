/**
 * CheckboxField - Single checkbox input
 * Uses custom visual checkbox matching MultiSelectField style
 */

import type { JSX } from 'react';
import type { FieldConfig } from '../../models/FieldConfig';
import { useFormKitContext } from '../context/FormKitContext';
import FieldError from '../layout/FieldError';

/**
 * Props for CheckboxField
 */
type Props = {
  config: FieldConfig;
};

/**
 * CheckboxField component for boolean input
 * Follows WCAG 2.1 AA accessibility requirements
 */
export default function CheckboxField({ config }: Props): JSX.Element {
  const { getValue, setValue, getError, getTouched, setTouched, getValues } = useFormKitContext();

  const fieldId = `field-${config.key}`;
  const errorId = `${fieldId}-error`;
  const descId = `${fieldId}-desc`;

  const value = getValue(config.key);
  const error = getError(config.key);
  const touched = getTouched(config.key);
  const showError = touched && !!error;
  const isChecked = Boolean(value);

  // Compute disabled state
  const isDisabled =
    typeof config.disabled === 'function' ? config.disabled(getValues()) : config.disabled;

  // Build aria-describedby
  const describedBy =
    [showError ? errorId : null, config.description ? descId : null].filter(Boolean).join(' ') ||
    undefined;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (!isDisabled) {
        setValue(config.key, !isChecked);
      }
    }
  };

  return (
    <div className="formkit-checkbox-field flex flex-col gap-1 mb-4">
      <div
        className={`flex items-start gap-3 ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        onClick={() => !isDisabled && setValue(config.key, !isChecked)}
      >
        {/* Hidden native checkbox for form submission and a11y */}
        <input
          id={fieldId}
          name={config.key}
          type="checkbox"
          checked={isChecked}
          disabled={isDisabled}
          aria-invalid={showError}
          aria-required={config.required}
          aria-describedby={describedBy}
          onChange={(e) => setValue(config.key, e.target.checked)}
          onBlur={() => setTouched(config.key, true)}
          onKeyDown={handleKeyDown}
          className="sr-only"
        />

        {/* Custom visual checkbox - matches MultiSelectField style */}
        <span
          className={`
            formkit-checkbox
            flex-shrink-0
            w-5 h-5 mt-0.5
            border rounded
            flex items-center justify-center
            transition-all duration-150
            ${isChecked ? 'bg-blue-600 border-blue-600' : 'border-gray-300 hover:border-gray-400'}
            ${showError ? 'border-red-500' : ''}
            ${isDisabled ? 'opacity-50' : ''}
          `}
          aria-hidden="true"
        >
          {isChecked && (
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </span>

        <div className="flex flex-col">
          <label
            htmlFor={fieldId}
            className={`
              formkit-checkbox-label
              text-sm font-medium text-gray-700
              ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
            `}
          >
            {config.label}
            {config.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {config.description && (
            <p id={descId} className="text-xs text-gray-500 mt-0.5">
              {config.description}
            </p>
          )}
        </div>
      </div>

      {showError && <FieldError id={errorId} message={error} />}
    </div>
  );
}

export type { Props as CheckboxFieldProps };

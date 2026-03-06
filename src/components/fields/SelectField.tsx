/**
 * SelectField - Dropdown select input
 */

import type { JSX } from 'react';
import type { FieldConfig } from '../../models/FieldConfig';
import { useFormKitContext } from '../context/FormKitContext';
import FieldLabel from '../layout/FieldLabel';
import FieldError from '../layout/FieldError';

/**
 * Props for SelectField
 */
type Props = {
  config: FieldConfig;
};

/**
 * SelectField component for dropdown selection
 * Follows WCAG 2.1 AA accessibility requirements
 */
export default function SelectField({ config }: Props): JSX.Element {
  const { getValue, setValue, getError, getTouched, setTouched, getValues } = useFormKitContext();

  const fieldId = `field-${config.key}`;
  const errorId = `${fieldId}-error`;
  const descId = `${fieldId}-desc`;

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
    <div className="formkit-select-field flex flex-col gap-1 mb-4">
      <FieldLabel htmlFor={fieldId} label={config.label} required={config.required} />

      <select
        id={fieldId}
        name={config.key}
        value={String(value ?? '')}
        disabled={isDisabled}
        aria-invalid={showError}
        aria-required={config.required}
        aria-describedby={describedBy}
        onChange={(e) => setValue(config.key, e.target.value)}
        onBlur={() => setTouched(config.key, true)}
        className={`
          formkit-select
          w-full px-3 py-2 sm:px-4 sm:py-2.5
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
      >
        {config.placeholder && (
          <option value="" disabled>
            {config.placeholder}
          </option>
        )}
        {config.options?.map((option) => (
          <option
            key={String(option.value)}
            value={String(option.value)}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>

      {config.description && !showError && (
        <p id={descId} className="text-xs text-gray-500 mt-1">
          {config.description}
        </p>
      )}

      {showError && <FieldError id={errorId} message={error} />}
    </div>
  );
}

export type { Props as SelectFieldProps };

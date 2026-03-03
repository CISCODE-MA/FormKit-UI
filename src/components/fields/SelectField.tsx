/**
 * SelectField - Dropdown select input
 */

import type { JSX } from 'react';
import type { FieldConfig } from '../../models/FieldConfig';
import { useFormKitContext } from '../context/FormKitContext';
import { FieldLabel } from '../layout/FieldLabel';
import { FieldError } from '../layout/FieldError';

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
export function SelectField({ config }: Props): JSX.Element {
  const { getValue, setValue, getError, getTouched, setTouched, getValues } = useFormKitContext();

  const fieldId = `field-${config.key}`;
  const errorId = `${fieldId}-error`;
  const descId = `${fieldId}-desc`;

  const value = getValue(config.key);
  const error = getError(config.key);
  const touched = getTouched(config.key);
  const showError = touched && !!error;

  // Compute disabled state
  const isDisabled =
    typeof config.disabled === 'function' ? config.disabled(getValues()) : config.disabled;

  // Build aria-describedby
  const describedBy =
    [showError ? errorId : null, config.description ? descId : null].filter(Boolean).join(' ') ||
    undefined;

  return (
    <div className="formkit-select-field flex flex-col gap-1">
      <FieldLabel htmlFor={fieldId} label={config.label} required={config.required} />

      {config.description && (
        <p id={descId} className="text-sm text-gray-500">
          {config.description}
        </p>
      )}

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
          w-full px-3 py-2
          border rounded-md
          focus:outline-none focus:ring-2 focus:ring-blue-500
          ${showError ? 'border-red-500' : 'border-gray-300'}
          ${isDisabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
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

      {showError && <FieldError id={errorId} message={error} />}
    </div>
  );
}

export type { Props as SelectFieldProps };

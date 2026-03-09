/**
 * DateTimeField - Combined date and time input component
 */

import type { JSX } from 'react';
import type { FieldConfig } from '../../models/FieldConfig';
import { useFormKitContext } from '../context/FormKitContext';
import FieldLabel from '../layout/FieldLabel';
import FieldError from '../layout/FieldError';

/**
 * Props for DateTimeField
 */
type Props = {
  config: FieldConfig;
};

/**
 * DateTimeField component for combined date and time input
 * Value format: ISO datetime string (YYYY-MM-DDTHH:mm)
 * Follows WCAG 2.1 AA accessibility requirements
 */
export default function DateTimeField({ config }: Props): JSX.Element {
  const { getValue, setValue, getError, getTouched, setTouched, getValues } = useFormKitContext();

  const fieldId = `field-${config.key}`;
  const errorId = `${fieldId}-error`;
  const descId = `${fieldId}-desc`;

  const value = getValue(config.key);
  const error = getError(config.key);
  const touched = getTouched(config.key);
  const showError = touched && !!error;

  // Parse string value (YYYY-MM-DDTHH:mm format)
  const currentValue = typeof value === 'string' ? value : '';

  // Config options
  const timeStep = config.timeStep ?? 60; // Default 1 minute (in seconds)

  // Compute disabled state
  const isDisabled =
    typeof config.disabled === 'function' ? config.disabled(getValues()) : config.disabled;

  // Build aria-describedby
  const describedBy =
    [showError ? errorId : null, config.description ? descId : null].filter(Boolean).join(' ') ||
    undefined;

  return (
    <div className="formkit-datetime-field flex flex-col gap-1 mb-4">
      <FieldLabel htmlFor={fieldId} label={config.label} required={config.required} />

      <div className="relative">
        <input
          id={fieldId}
          name={config.key}
          type="datetime-local"
          value={currentValue}
          step={timeStep}
          disabled={isDisabled}
          readOnly={config.readOnly}
          aria-invalid={showError}
          aria-required={config.required}
          aria-describedby={describedBy}
          onChange={(e) => setValue(config.key, e.target.value)}
          onBlur={() => setTouched(config.key, true)}
          className={`
            formkit-datetime-input
            w-full px-3 py-2
            border border-solid rounded-lg
            transition-colors duration-150
            focus:outline-none focus:ring-2 focus:ring-blue-500
            ${
              showError
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 hover:border-gray-400 focus:border-blue-500'
            }
            ${isDisabled ? 'bg-gray-100 cursor-not-allowed opacity-50' : 'bg-white'}
            ${config.readOnly ? 'bg-gray-50' : ''}
          `}
        />
      </div>

      {config.description && !showError && (
        <p id={descId} className="text-xs text-gray-500">
          {config.description}
        </p>
      )}

      {showError && <FieldError id={errorId} message={error} />}
    </div>
  );
}

export type { Props as DateTimeFieldProps };

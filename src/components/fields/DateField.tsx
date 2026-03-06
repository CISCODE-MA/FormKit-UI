/**
 * DateField - Date input
 */

import type { JSX } from 'react';
import type { FieldConfig } from '../../models/FieldConfig';
import { useFormKitContext } from '../context/FormKitContext';
import FieldLabel from '../layout/FieldLabel';
import FieldError from '../layout/FieldError';

/**
 * Props for DateField
 */
type Props = {
  config: FieldConfig;
};

/**
 * DateField component for date input
 * Follows WCAG 2.1 AA accessibility requirements
 */
export default function DateField({ config }: Props): JSX.Element {
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

  // Format value for date input (expects YYYY-MM-DD)
  const formatDateValue = (): string => {
    if (!value) return '';
    if (value instanceof Date) {
      return value.toISOString().split('T')[0];
    }
    return String(value);
  };

  return (
    <div className="formkit-date-field flex flex-col gap-1">
      <FieldLabel htmlFor={fieldId} label={config.label} required={config.required} />

      {config.description && (
        <p id={descId} className="text-sm text-gray-500">
          {config.description}
        </p>
      )}

      <input
        id={fieldId}
        name={config.key}
        type="date"
        value={formatDateValue()}
        disabled={isDisabled}
        readOnly={config.readOnly}
        aria-invalid={showError}
        aria-required={config.required}
        aria-describedby={describedBy}
        onChange={(e) => setValue(config.key, e.target.value)}
        onBlur={() => setTouched(config.key, true)}
        className={`
          formkit-date-input
          w-full px-3 py-2
          border rounded-md
          focus:outline-none focus:ring-2 focus:ring-blue-500
          ${showError ? 'border-red-500' : 'border-gray-300'}
          ${isDisabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
        `}
      />

      {showError && <FieldError id={errorId} message={error} />}
    </div>
  );
}

export type { Props as DateFieldProps };

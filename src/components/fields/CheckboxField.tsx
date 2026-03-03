/**
 * CheckboxField - Single checkbox input
 */

import type { JSX } from 'react';
import type { FieldConfig } from '../../models/FieldConfig';
import { useFormKitContext } from '../context/FormKitContext';
import { FieldError } from '../layout/FieldError';

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
export function CheckboxField({ config }: Props): JSX.Element {
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
    <div className="formkit-checkbox-field flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <input
          id={fieldId}
          name={config.key}
          type="checkbox"
          checked={Boolean(value)}
          disabled={isDisabled}
          aria-invalid={showError}
          aria-required={config.required}
          aria-describedby={describedBy}
          onChange={(e) => setValue(config.key, e.target.checked)}
          onBlur={() => setTouched(config.key, true)}
          className={`
            formkit-checkbox
            h-4 w-4
            rounded
            border-gray-300
            text-blue-600
            focus:ring-2 focus:ring-blue-500
            ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
          `}
        />
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
      </div>

      {config.description && (
        <p id={descId} className="text-sm text-gray-500 ml-6">
          {config.description}
        </p>
      )}

      {showError && <FieldError id={errorId} message={error} />}
    </div>
  );
}

export type { Props as CheckboxFieldProps };

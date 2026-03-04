/**
 * SwitchField - Toggle switch input
 */

import type { JSX } from 'react';
import type { FieldConfig } from '../../models/FieldConfig';
import { useFormKitContext } from '../context/FormKitContext';
import FieldError from '../layout/FieldError';

/**
 * Props for SwitchField
 */
type Props = {
  config: FieldConfig;
};

/**
 * SwitchField component for boolean toggle
 * Follows WCAG 2.1 AA accessibility requirements
 */
export default function SwitchField({ config }: Props): JSX.Element {
  const { getValue, setValue, getError, getTouched, setTouched, getValues } = useFormKitContext();

  const fieldId = `field-${config.key}`;
  const labelId = `${fieldId}-label`;
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

  return (
    <div className="formkit-switch-field flex flex-col gap-1">
      <div className="flex items-center gap-3">
        <button
          id={fieldId}
          type="button"
          role="switch"
          aria-checked={isChecked}
          aria-labelledby={labelId}
          aria-invalid={showError}
          aria-required={config.required}
          aria-describedby={describedBy}
          disabled={isDisabled}
          onClick={() => setValue(config.key, !isChecked)}
          onBlur={() => setTouched(config.key, true)}
          className={`
            formkit-switch
            relative inline-flex h-6 w-11
            flex-shrink-0 rounded-full
            border-2 border-transparent
            transition-colors duration-200 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            ${isChecked ? 'bg-blue-600' : 'bg-gray-200'}
            ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
          `}
        >
          <span
            aria-hidden="true"
            className={`
              pointer-events-none inline-block h-5 w-5
              transform rounded-full bg-white shadow
              ring-0 transition duration-200 ease-in-out
              ${isChecked ? 'translate-x-5' : 'translate-x-0'}
            `}
          />
        </button>
        <span
          id={labelId}
          className={`
            formkit-switch-label
            text-sm font-medium text-gray-700
            ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
          `}
          onClick={() => !isDisabled && setValue(config.key, !isChecked)}
        >
          {config.label}
          {config.required && <span className="text-red-500 ml-1">*</span>}
        </span>
      </div>

      {config.description && (
        <p id={descId} className="text-sm text-gray-500 ml-14">
          {config.description}
        </p>
      )}

      {showError && <FieldError id={errorId} message={error} />}
    </div>
  );
}

export type { Props as SwitchFieldProps };

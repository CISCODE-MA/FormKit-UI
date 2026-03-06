/**
 * CheckboxField - Single checkbox input
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

  // Compute disabled state
  const isDisabled =
    typeof config.disabled === 'function' ? config.disabled(getValues()) : config.disabled;

  // Build aria-describedby
  const describedBy =
    [showError ? errorId : null, config.description ? descId : null].filter(Boolean).join(' ') ||
    undefined;

  return (
    <div className="formkit-checkbox-field flex flex-col gap-1 mb-4">
      <div className="flex items-start gap-3">
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
            h-5 w-5 mt-0.5
            rounded
            border-2 border-gray-300
            text-blue-600
            transition-all duration-150
            focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            hover:border-gray-400
            ${showError ? 'border-red-500 focus:ring-red-500' : ''}
            ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
          `}
        />
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

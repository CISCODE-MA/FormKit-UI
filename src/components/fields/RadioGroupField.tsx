/**
 * RadioGroupField - Radio button group
 */

import type { JSX } from 'react';
import type { FieldConfig } from '../../models/FieldConfig';
import { useFormKitContext } from '../context/FormKitContext';
import FieldLabel from '../layout/FieldLabel';
import FieldError from '../layout/FieldError';

/**
 * Props for RadioGroupField
 */
type Props = {
  config: FieldConfig;
};

/**
 * RadioGroupField component for selecting one option from a group
 * Follows WCAG 2.1 AA accessibility requirements
 */
export default function RadioGroupField({ config }: Props): JSX.Element {
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
    <fieldset
      className="formkit-radio-group-field flex flex-col gap-2"
      aria-describedby={describedBy}
    >
      <FieldLabel as="legend" label={config.label} required={config.required} />

      {config.description && (
        <p id={descId} className="text-sm text-gray-500">
          {config.description}
        </p>
      )}

      <div
        className="flex flex-col gap-2"
        role="radiogroup"
        aria-invalid={showError}
        aria-required={config.required}
      >
        {config.options?.map((option) => {
          const optionId = `${fieldId}-${option.value}`;
          const isChecked = value === option.value;

          return (
            <div key={String(option.value)} className="flex items-center gap-2">
              <input
                id={optionId}
                name={config.key}
                type="radio"
                value={String(option.value)}
                checked={isChecked}
                disabled={isDisabled || option.disabled}
                onChange={(e) => setValue(config.key, e.target.value)}
                onBlur={() => setTouched(config.key, true)}
                className={`
                  formkit-radio
                  h-4 w-4
                  border-gray-300
                  text-blue-600
                  focus:ring-2 focus:ring-blue-500
                  ${isDisabled || option.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                `}
              />
              <label
                htmlFor={optionId}
                className={`
                  formkit-radio-label
                  text-sm font-medium text-gray-700
                  ${isDisabled || option.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                `}
              >
                {option.label}
              </label>
            </div>
          );
        })}
      </div>

      {showError && <FieldError id={errorId} message={error} />}
    </fieldset>
  );
}

export type { Props as RadioGroupFieldProps };

/**
 * TextField - Handles text, email, password, and number inputs
 */

import type { JSX } from 'react';
import type { FieldConfig } from '../../models/FieldConfig';
import { FieldType } from '../../core/types';
import { useFormKitContext } from '../context/FormKitContext';
import FieldLabel from '../layout/FieldLabel';
import FieldError from '../layout/FieldError';

/**
 * Props for TextField
 */
type Props = {
  config: FieldConfig;
};

/**
 * TextField component for text, email, password, and number inputs
 * Follows WCAG 2.1 AA accessibility requirements
 */
export default function TextField({ config }: Readonly<Props>): JSX.Element {
  const { getValue, setValue, getError, getTouched, setTouched, getValues } = useFormKitContext();

  const fieldId = `field-${config.key}`;
  const errorId = `${fieldId}-error`;
  const descId = `${fieldId}-desc`;

  const value = getValue(config.key);
  const error = getError(config.key);
  const touched = getTouched(config.key);
  const showError = touched && !!error;

  // Map FieldType to input type
  const inputType = (): string => {
    switch (config.type) {
      case FieldType.EMAIL:
        return 'email';
      case FieldType.PASSWORD:
        return 'password';
      case FieldType.NUMBER:
        return 'number';
      default:
        return 'text';
    }
  };

  // Compute disabled state
  const isDisabled =
    typeof config.disabled === 'function' ? config.disabled(getValues()) : config.disabled;

  // Build aria-describedby
  const describedBy =
    [showError ? errorId : null, config.description ? descId : null].filter(Boolean).join(' ') ||
    undefined;

  const inputValue = typeof value === 'string' || typeof value === 'number' ? String(value) : '';

  return (
    <div className="formkit-text-field flex flex-col gap-1">
      <FieldLabel htmlFor={fieldId} label={config.label} required={config.required} />

      {config.description && (
        <p id={descId} className="text-sm text-gray-500">
          {config.description}
        </p>
      )}

      <input
        id={fieldId}
        name={config.key}
        type={inputType()}
        value={inputValue}
        placeholder={config.placeholder}
        disabled={isDisabled}
        readOnly={config.readOnly}
        aria-invalid={showError}
        aria-required={config.required}
        aria-describedby={describedBy}
        onChange={(e) => {
          const newValue =
            config.type === FieldType.NUMBER ? Number(e.target.value) : e.target.value;
          setValue(config.key, newValue);
        }}
        onBlur={() => setTouched(config.key, true)}
        className={`
          formkit-input
          w-full px-3 py-2
          border rounded-md
          focus:outline-none focus:ring-2 ${showError ? 'focus:ring-red-500' : 'focus:ring-blue-500'}
          ${showError ? 'border-red-500' : 'border-gray-300'}
          ${isDisabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
        `}
      />

      {showError && <FieldError id={errorId} message={error} />}
    </div>
  );
}

export type { Props as TextFieldProps };

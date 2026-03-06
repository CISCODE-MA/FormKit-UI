/**
 * FileField - File upload input
 */

import type { JSX, ChangeEvent } from 'react';
import type { FieldConfig } from '../../models/FieldConfig';
import { useFormKitContext } from '../context/FormKitContext';
import FieldLabel from '../layout/FieldLabel';
import FieldError from '../layout/FieldError';

/**
 * Props for FileField
 */
type Props = {
  config: FieldConfig;
};

/**
 * FileField component for file uploads
 * Follows WCAG 2.1 AA accessibility requirements
 */
export default function FileField({ config }: Props): JSX.Element {
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

  // Handle file selection
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // Store single file or array based on multiple
      setValue(config.key, files.length === 1 ? files[0] : Array.from(files));
    }
  };

  // Display selected file name(s)
  const getFileName = (): string => {
    if (!value) return '';
    if (value instanceof File) return value.name;
    if (Array.isArray(value) && value.length > 0 && value[0] instanceof File) {
      return (value as File[]).map((f) => f.name).join(', ');
    }
    return '';
  };

  return (
    <div className="formkit-file-field flex flex-col gap-1 mb-4">
      <FieldLabel htmlFor={fieldId} label={config.label} required={config.required} />

      <div className="flex flex-col gap-2">
        <input
          id={fieldId}
          name={config.key}
          type="file"
          disabled={isDisabled}
          aria-invalid={showError}
          aria-required={config.required}
          aria-describedby={describedBy}
          onChange={handleChange}
          onBlur={() => setTouched(config.key, true)}
          className={`
            formkit-file-input
            w-full px-3 py-2 sm:px-4 sm:py-2.5
            text-sm sm:text-base
            border rounded-md
            transition-all duration-150
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-medium
            file:bg-blue-600 file:text-white
            file:transition-colors file:duration-150
            hover:file:bg-blue-700
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            ${
              showError
                ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 hover:border-gray-400'
            }
            ${
              isDisabled
                ? 'bg-gray-100 text-gray-500 cursor-not-allowed file:bg-gray-400 file:cursor-not-allowed'
                : 'bg-white'
            }
          `}
        />
        {value && (
          <p className="text-xs text-gray-600">
            <span className="font-medium">Selected:</span> {getFileName()}
          </p>
        )}
      </div>

      {config.description && !showError && (
        <p id={descId} className="text-xs text-gray-500 mt-1">
          {config.description}
        </p>
      )}

      {showError && <FieldError id={errorId} message={error} />}
    </div>
  );
}

export type { Props as FileFieldProps };

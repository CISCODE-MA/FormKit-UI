/**
 * FileField - File upload input with type and size validation
 */

import { useState, type JSX, type ChangeEvent } from 'react';
import type { FieldConfig } from '../../models/FieldConfig';
import { useFormKitContext } from '../context/FormKitContext';
import FieldLabel from '../layout/FieldLabel';
import FieldError from '../layout/FieldError';

/**
 * Format file size for display
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Validate file against accepted types
 */
function isValidFileType(file: File, accept: string): boolean {
  if (!accept) return true;

  const acceptedTypes = accept.split(',').map((t) => t.trim().toLowerCase());
  const fileName = file.name.toLowerCase();
  const fileType = file.type.toLowerCase();

  return acceptedTypes.some((accepted) => {
    // Extension match (e.g., '.pdf')
    if (accepted.startsWith('.')) {
      return fileName.endsWith(accepted);
    }
    // Wildcard MIME type (e.g., 'image/*')
    if (accepted.endsWith('/*')) {
      const baseType = accepted.slice(0, -2);
      return fileType.startsWith(baseType + '/');
    }
    // Exact MIME type match
    return fileType === accepted;
  });
}

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
  const [fileError, setFileError] = useState<string | null>(null);

  const fieldId = `field-${config.key}`;
  const errorId = `${fieldId}-error`;
  const descId = `${fieldId}-desc`;

  const value = getValue(config.key);
  const error = getError(config.key) || fileError;
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
    setFileError(null);

    if (!files || files.length === 0) {
      setValue(config.key, null);
      return;
    }

    const fileList = Array.from(files);
    const errors: string[] = [];

    // Validate each file
    for (const file of fileList) {
      // Check file type
      if (config.accept && !isValidFileType(file, config.accept)) {
        errors.push(`"${file.name}" is not an accepted file type`);
        continue;
      }

      // Check file size
      if (config.maxFileSize && file.size > config.maxFileSize) {
        errors.push(`"${file.name}" exceeds max size of ${formatFileSize(config.maxFileSize)}`);
        continue;
      }
    }

    if (errors.length > 0) {
      setFileError(errors.join('. '));
      e.target.value = ''; // Clear the input
      return;
    }

    // Store single file or array based on multiple
    setValue(config.key, fileList.length === 1 ? fileList[0] : fileList);
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
    <div className="formkit-file-field flex flex-col gap-1">
      <FieldLabel htmlFor={fieldId} label={config.label} required={config.required} />

      {config.description && (
        <p id={descId} className="text-sm text-gray-500">
          {config.description}
        </p>
      )}

      <div className="flex flex-col gap-2">
        <input
          id={fieldId}
          name={config.key}
          type="file"
          accept={config.accept}
          multiple={config.multiple}
          disabled={isDisabled}
          aria-invalid={showError}
          aria-required={config.required}
          aria-describedby={describedBy}
          onChange={handleChange}
          onBlur={() => setTouched(config.key, true)}
          className={`
            formkit-file-input
            w-full px-3 py-2
            border rounded-md
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-medium
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100
            focus:outline-none focus:ring-2 focus:ring-blue-500
            ${showError ? 'border-red-500' : 'border-gray-300'}
            ${isDisabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
          `}
        />
        {value && <p className="text-sm text-gray-600">Selected: {getFileName()}</p>}

        {/* File constraints hint */}
        {(config.accept || config.maxFileSize) && !showError && (
          <p className="text-xs text-gray-500">
            {config.accept && <span>Accepted: {config.accept}</span>}
            {config.accept && config.maxFileSize && <span> · </span>}
            {config.maxFileSize && <span>Max size: {formatFileSize(config.maxFileSize)}</span>}
          </p>
        )}
      </div>

      {showError && <FieldError id={errorId} message={error} />}
    </div>
  );
}

export type { Props as FileFieldProps };

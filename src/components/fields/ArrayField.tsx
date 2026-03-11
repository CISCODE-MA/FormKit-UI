/**
 * ArrayField - Repeatable field group
 */

import type { JSX } from 'react';
import { useCallback, useMemo } from 'react';
import type { FieldConfig } from '../../models/FieldConfig';
import type { FieldValue } from '../../core/types';
import { useFormKitContext } from '../context/FormKitContext';
import { useI18n } from '../../hooks/useI18n';
import FieldLabel from '../layout/FieldLabel';
import FieldError from '../layout/FieldError';

/**
 * Props for ArrayField
 */
type Props = {
  config: FieldConfig;
};

/**
 * ArrayField component for repeatable field groups
 * Follows WCAG 2.1 AA accessibility requirements
 */
export default function ArrayField({ config }: Props): JSX.Element {
  const { getValue, setValue, getError, getValues } = useFormKitContext();
  const { t } = useI18n();

  const fieldId = `field-${config.key}`;
  const errorId = `${fieldId}-error`;
  const descId = `${fieldId}-desc`;

  const value = getValue(config.key);
  const error = getError(config.key);

  // Ensure value is an array (wrapped in useMemo for stable reference)
  const rows = useMemo(() => (Array.isArray(value) ? value : []), [value]);

  // Compute disabled state
  const isDisabled =
    typeof config.disabled === 'function' ? config.disabled(getValues()) : config.disabled;

  // Constraints
  const minRows = config.minRows ?? 0;
  const maxRows = config.maxRows ?? Infinity;
  const canAdd = rows.length < maxRows && !isDisabled;
  const canRemove = rows.length > minRows && !isDisabled;

  // Labels
  const addLabel = config.addLabel ?? t('field.add');
  const removeLabel = config.removeLabel ?? t('field.remove');

  // Add a new row
  const handleAdd = useCallback(() => {
    if (!canAdd) return;
    const newRow: Record<string, FieldValue> = {};
    config.arrayFields?.forEach((field) => {
      newRow[field.key] = '';
    });
    setValue(config.key, [...rows, newRow]);
  }, [canAdd, rows, config.arrayFields, config.key, setValue]);

  // Remove a row
  const handleRemove = useCallback(
    (index: number) => {
      if (!canRemove) return;
      setValue(
        config.key,
        rows.filter((_, i) => i !== index),
      );
    },
    [canRemove, rows, config.key, setValue],
  );

  // Update a field in a row
  const handleFieldChange = useCallback(
    (rowIndex: number, fieldKey: string, fieldValue: FieldValue) => {
      const newRows = rows.map((row, i) => {
        if (i !== rowIndex) return row;
        return { ...(row as Record<string, FieldValue>), [fieldKey]: fieldValue };
      });
      setValue(config.key, newRows);
    },
    [rows, config.key, setValue],
  );

  return (
    <fieldset className="formkit-array-field flex flex-col gap-4">
      <FieldLabel as="legend" label={config.label} required={config.required} />

      {config.description && (
        <p id={descId} className="text-sm text-gray-500">
          {config.description}
        </p>
      )}

      {/* Rows */}
      <div className="flex flex-col gap-4">
        {rows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="formkit-array-row flex gap-4 items-start p-4 border rounded-md bg-gray-50"
          >
            {/* Row fields */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              {config.arrayFields?.map((fieldConfig) => {
                const rowData = row as Record<string, FieldValue>;
                const fieldValue = rowData[fieldConfig.key] ?? '';
                const inputId = `${fieldId}-${rowIndex}-${fieldConfig.key}`;

                return (
                  <div key={fieldConfig.key} className="flex flex-col gap-1">
                    <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
                      {fieldConfig.label}
                      {fieldConfig.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <input
                      id={inputId}
                      type="text"
                      value={String(fieldValue)}
                      placeholder={fieldConfig.placeholder}
                      disabled={isDisabled}
                      onChange={(e) => handleFieldChange(rowIndex, fieldConfig.key, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                );
              })}
            </div>

            {/* Remove button */}
            <button
              type="button"
              onClick={() => handleRemove(rowIndex)}
              disabled={!canRemove}
              aria-label={`${removeLabel} ${config.label} ${rowIndex + 1}`}
              className={`
                px-3 py-2 text-sm font-medium
                border rounded-md
                ${canRemove ? 'text-red-600 border-red-300 hover:bg-red-50' : 'text-gray-400 border-gray-200 cursor-not-allowed'}
              `}
            >
              {removeLabel}
            </button>
          </div>
        ))}
      </div>

      {/* Add button */}
      <button
        type="button"
        onClick={handleAdd}
        disabled={!canAdd}
        aria-label={`${addLabel} ${config.label}`}
        className={`
          self-start px-4 py-2 text-sm font-medium
          border rounded-md
          ${canAdd ? 'text-blue-600 border-blue-300 hover:bg-blue-50' : 'text-gray-400 border-gray-200 cursor-not-allowed'}
        `}
      >
        {addLabel}
      </button>

      {error && <FieldError id={errorId} message={error} />}
    </fieldset>
  );
}

export type { Props as ArrayFieldProps };

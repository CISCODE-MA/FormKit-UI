/**
 * ArrayField - Repeatable field group with reordering, collapsible rows, and rich accessibility
 */

import type { JSX, ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FieldType } from '../../core/types';
import type { FieldConfig } from '../../models/FieldConfig';
import type { FieldValue, FormValues } from '../../core/types';
import { FormKitContext, useFormKitContext } from '../context/FormKitContext';
import type { FormContextValue } from '../../models/FormState';
import { useI18n } from '../../hooks/useI18n';
import FieldLabel from '../layout/FieldLabel';
import FieldError from '../layout/FieldError';
import Field from './Field';

/**
 * Props for ArrayField
 */
type Props = {
  config: FieldConfig;
};

/**
 * Props for ArrayRowProvider
 */
type ArrayRowProviderProps = {
  /** Row data */
  rowData: Record<string, FieldValue>;
  /** Row index */
  rowIndex: number;
  /** Parent array key */
  arrayKey: string;
  /** Callback to update a field in the row */
  onFieldChange: (rowIndex: number, fieldKey: string, value: FieldValue) => void;
  /** Whether the array is disabled */
  isDisabled: boolean;
  /** Children to render */
  children: ReactNode;
};

function getRowHintMessage(
  minRows: number,
  maxRows: number,
  t: (key: string, params?: Record<string, number>) => string,
): string {
  if (minRows > 0 && maxRows < Infinity) {
    return t('array.minMaxHint', { min: minRows, max: maxRows });
  }
  if (minRows > 0) {
    return t('array.minHint', { min: minRows });
  }
  return t('array.maxHint', { max: maxRows });
}

/**
 * Provides a scoped FormKitContext for each array row
 * This allows nested Field components to use the existing field implementations
 * Routes validation errors from parent context using path notation (e.g., contacts.0.email)
 */
function ArrayRowProvider({
  rowData,
  rowIndex,
  arrayKey,
  onFieldChange,
  isDisabled,
  children,
}: ArrayRowProviderProps): JSX.Element {
  const parentContext = useFormKitContext();

  // Track touched state per field within this row (local state for immediate feedback)
  const [localTouched, setLocalTouched] = useState<Set<string>>(new Set());

  // Create a scoped context value for this row
  // Routes errors from parent context using path notation: arrayKey.rowIndex.fieldKey
  const scopedContext = useMemo<FormContextValue>(() => {
    return {
      getValue: (key) => rowData[key as string] ?? '',
      setValue: (key, value) => onFieldChange(rowIndex, key as string, value),
      // Route error lookups to parent with full path (e.g., contacts.0.email)
      getError: (key) => {
        const fullPath = `${arrayKey}.${rowIndex}.${key as string}`;
        return parentContext.getError(fullPath as keyof FormValues);
      },
      // Route error setting to parent with full path
      setError: (key, error) => {
        const fullPath = `${arrayKey}.${rowIndex}.${key as string}`;
        parentContext.setError(fullPath as keyof FormValues, error);
      },
      // Check both local touched state and parent touched state
      getTouched: (key) => {
        const fullPath = `${arrayKey}.${rowIndex}.${key as string}`;
        return (
          localTouched.has(key as string) || parentContext.getTouched(fullPath as keyof FormValues)
        );
      },
      // Set touched in both local state (for immediate feedback) and parent context
      setTouched: (key, touched) => {
        if (touched) {
          setLocalTouched((prev) => new Set(prev).add(key as string));
          // Also set touched in parent with full path
          const fullPath = `${arrayKey}.${rowIndex}.${key as string}`;
          parentContext.setTouched(fullPath as keyof FormValues, true);
        }
        // Mark the array itself as touched
        parentContext.setTouched(arrayKey as keyof FormValues, true);
      },
      getValues: () => rowData as FormValues,
      isSubmitting: parentContext.isSubmitting,
      isValid: true, // Individual fields determine their own validity
    };
  }, [rowData, rowIndex, arrayKey, onFieldChange, localTouched, parentContext]);

  // If parent is disabled, provide a context that reports disabled
  const finalContext = useMemo<FormContextValue>(() => {
    if (!isDisabled) return scopedContext;
    return {
      ...scopedContext,
      getValues: () => ({ ...rowData, _disabled: true }) as FormValues,
    };
  }, [scopedContext, isDisabled, rowData]);

  return <FormKitContext.Provider value={finalContext}>{children}</FormKitContext.Provider>;
}

/**
 * Icons for the ArrayField UI
 */
const ChevronUpIcon = (): JSX.Element => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
  </svg>
);

const ChevronDownIcon = (): JSX.Element => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const TrashIcon = (): JSX.Element => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);

const PlusIcon = (): JSX.Element => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

/**
 * ArrayField component for repeatable field groups
 * Follows WCAG 2.1 AA accessibility requirements
 *
 * Features:
 * - Collapsible rows with summary
 * - Reuses existing Field components for full feature support
 * - Each nested field handles its own validation
 * - Dropdowns/popovers float above row containers
 * - Empty state with call-to-action
 * - Confirmation before remove (optional)
 * - Keyboard accessible
 */
export default function ArrayField({ config }: Readonly<Props>): JSX.Element {
  const { getValue, setValue, getError, getValues } = useFormKitContext();
  const { t } = useI18n();

  const fieldId = `field-${config.key}`;
  const errorId = `${fieldId}-error`;
  const descId = `${fieldId}-desc`;
  const liveRegionId = `${fieldId}-live`;

  const value = getValue(config.key);
  const error = getError(config.key);
  const showError = !!error;

  // Track collapsed rows
  const [collapsedRows, setCollapsedRows] = useState<Set<number>>(new Set());
  // Track pending remove confirmation
  const [confirmingRemove, setConfirmingRemove] = useState<number | null>(null);
  // Live region announcements
  const [announcement, setAnnouncement] = useState('');
  const announcementTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Ensure value is an array
  const rows = useMemo(() => (Array.isArray(value) ? value : []), [value]);

  // Compute disabled state
  const isDisabled =
    typeof config.disabled === 'function' ? config.disabled(getValues()) : config.disabled;

  // Config options with defaults
  const minRows = config.minRows ?? 0;
  const maxRows = config.maxRows ?? Infinity;
  const collapsible = config.collapsible ?? false;
  const confirmRemove = config.confirmRemove ?? false;

  // Computed constraints
  const canAdd = rows.length < maxRows && !isDisabled;
  const canRemove = rows.length > minRows && !isDisabled;

  // Labels
  const addLabel = config.addLabel ?? t('field.add');
  const removeLabel = config.removeLabel ?? t('field.remove');
  const emptyMessage = config.emptyMessage ?? t('array.empty');

  // Announce changes for screen readers
  const announce = useCallback((message: string) => {
    setAnnouncement(message);
    if (announcementTimerRef.current) {
      clearTimeout(announcementTimerRef.current);
    }
    announcementTimerRef.current = setTimeout(() => {
      setAnnouncement('');
      announcementTimerRef.current = null;
    }, 1000);
  }, []);

  useEffect(() => {
    return () => {
      if (announcementTimerRef.current) {
        clearTimeout(announcementTimerRef.current);
      }
    };
  }, []);

  // Add a new row
  const handleAdd = useCallback(() => {
    if (!canAdd) return;
    const newRow: Record<string, FieldValue> = {};
    config.arrayFields?.forEach((field) => {
      newRow[field.key] = field.type === FieldType.CHECKBOX ? false : '';
    });
    setValue(config.key, [...rows, newRow]);
    announce(t('array.rowAdded'));
  }, [canAdd, rows, config.arrayFields, config.key, setValue, announce, t]);

  // Remove a row
  const handleRemove = useCallback(
    (index: number) => {
      if (!canRemove) return;

      // If confirmation required and not yet confirming
      if (confirmRemove && confirmingRemove !== index) {
        setConfirmingRemove(index);
        return;
      }

      setValue(
        config.key,
        rows.filter((_, i) => i !== index),
      );
      setConfirmingRemove(null);
      // Update collapsed rows indices
      setCollapsedRows((prev) => {
        const newSet = new Set<number>();
        prev.forEach((i) => {
          if (i < index) newSet.add(i);
          else if (i > index) newSet.add(i - 1);
        });
        return newSet;
      });
      announce(t('array.rowRemoved'));
    },
    [canRemove, confirmRemove, confirmingRemove, rows, config.key, setValue, announce, t],
  );

  // Cancel remove confirmation
  const cancelRemove = useCallback(() => {
    setConfirmingRemove(null);
  }, []);

  // Toggle row collapse
  const toggleCollapse = useCallback((index: number) => {
    setCollapsedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, []);

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

  // Get row summary for collapsed state
  const getRowSummary = useCallback(
    (row: Record<string, FieldValue>): string => {
      const firstField = config.arrayFields?.[0];
      if (!firstField) return `${t('array.row')}`;
      const val = row[firstField.key];
      return val ? String(val) : `${t('array.row')}`;
    },
    [config.arrayFields, t],
  );

  // aria-describedby computation
  const describedBy =
    [config.description ? descId : null, showError ? errorId : null].filter(Boolean).join(' ') ||
    undefined;

  return (
    <fieldset
      className="formkit-array-field flex flex-col gap-4 mb-4"
      aria-describedby={describedBy}
    >
      <div className="flex items-center justify-between">
        <FieldLabel as="legend" label={config.label} required={config.required} />
        <span className="text-sm text-gray-500">
          {rows.length} / {maxRows === Infinity ? '∞' : maxRows}
        </span>
      </div>

      {config.description && (
        <p id={descId} className="text-sm text-gray-500 -mt-2">
          {config.description}
        </p>
      )}

      {/* Live region for announcements */}
      <div id={liveRegionId} aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>

      {/* Empty state */}
      {rows.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 px-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
          <p className="text-gray-500 mb-4">{emptyMessage}</p>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!canAdd}
            className={`
              inline-flex items-center gap-2 px-4 py-2
              text-sm font-medium rounded-md
              transition-colors duration-150
              ${canAdd ? 'text-white bg-blue-600 hover:bg-blue-700' : 'text-gray-400 bg-gray-200 cursor-not-allowed'}
            `}
          >
            <PlusIcon />
            {addLabel}
          </button>
        </div>
      )}

      {/* Rows */}
      {rows.length > 0 && (
        <div className="flex flex-col gap-3">
          {rows.map((row, rowIndex) => {
            const rowData = row as Record<string, FieldValue>;
            const isCollapsed = collapsible && collapsedRows.has(rowIndex);
            const isConfirming = confirmingRemove === rowIndex;

            return (
              <div
                key={rowIndex}
                className={`
                  formkit-array-row relative
                  border rounded-lg
                  transition-all duration-200
                  ${showError ? 'border-red-300 bg-red-50/50' : 'border-gray-200 bg-white'}
                `}
              >
                {/* Row header - stable layout with fixed control positions */}
                <div
                  className={`
                    flex items-center px-3 py-2
                    ${showError ? 'bg-red-50' : 'bg-gray-50'}
                  `}
                >
                  {/* Row number - fixed width */}
                  <span className="text-sm font-medium text-gray-700 w-8 shrink-0">
                    #{rowIndex + 1}
                  </span>

                  {/* Row summary - always takes remaining space for stable layout */}
                  <span className="flex-1 text-sm text-gray-600 truncate min-w-0">
                    {isCollapsed ? getRowSummary(rowData) : ''}
                  </span>

                  {/* Controls container - fixed width for stable layout */}
                  <div className="flex items-center gap-1 shrink-0">
                    {/* Collapse toggle */}
                    {collapsible && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCollapse(rowIndex);
                        }}
                        aria-expanded={!isCollapsed}
                        aria-label={isCollapsed ? t('array.expand') : t('array.collapse')}
                        className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded"
                      >
                        {isCollapsed ? <ChevronDownIcon /> : <ChevronUpIcon />}
                      </button>
                    )}

                    {/* Remove button or confirmation */}
                    {isConfirming ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-red-600">{t('array.confirmRemove')}</span>
                        <button
                          type="button"
                          onClick={() => handleRemove(rowIndex)}
                          className="px-2 py-1 text-sm text-white bg-red-600 hover:bg-red-700 rounded"
                        >
                          {t('field.yes')}
                        </button>
                        <button
                          type="button"
                          onClick={cancelRemove}
                          className="px-2 py-1 text-sm text-gray-600 hover:bg-gray-200 rounded"
                        >
                          {t('field.no')}
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(rowIndex);
                        }}
                        disabled={!canRemove}
                        aria-label={`${removeLabel} ${config.label} ${rowIndex + 1}`}
                        className={`
                          p-1.5 rounded
                          transition-colors duration-150
                          ${canRemove ? 'text-red-500 hover:text-red-700 hover:bg-red-100' : 'text-gray-300 cursor-not-allowed'}
                        `}
                      >
                        <TrashIcon />
                      </button>
                    )}
                  </div>
                </div>

                {/* Row content (fields) - no overflow clipping to allow dropdowns to float */}
                {!isCollapsed && (
                  <div className="p-4 border-t border-gray-200 relative">
                    <ArrayRowProvider
                      rowData={rowData}
                      rowIndex={rowIndex}
                      arrayKey={config.key}
                      onFieldChange={handleFieldChange}
                      isDisabled={!!isDisabled}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {config.arrayFields?.map((fieldConfig) => (
                          <Field key={fieldConfig.key} config={fieldConfig} />
                        ))}
                      </div>
                    </ArrayRowProvider>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add button (when rows exist) */}
      {rows.length > 0 && (
        <button
          type="button"
          onClick={handleAdd}
          disabled={!canAdd}
          aria-label={`${addLabel} ${config.label}`}
          className={`
            self-start inline-flex items-center gap-2
            px-4 py-2 text-sm font-medium
            border rounded-md
            transition-colors duration-150
            ${canAdd ? 'text-blue-600 border-blue-300 hover:bg-blue-50 hover:border-blue-400' : 'text-gray-400 border-gray-200 cursor-not-allowed'}
          `}
        >
          <PlusIcon />
          {addLabel}
        </button>
      )}

      {/* Row count hint */}
      {(minRows > 0 || maxRows < Infinity) && (
        <p className="text-xs text-gray-500">{getRowHintMessage(minRows, maxRows, t)}</p>
      )}

      {showError && <FieldError id={errorId} message={error} />}
    </fieldset>
  );
}

export type { Props as ArrayFieldProps };

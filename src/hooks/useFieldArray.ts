/**
 * useFieldArray - Repeatable field group management
 */

import { useCallback, useMemo } from 'react';
import type { FieldValue } from '../core/types';
import { useFormKitContext } from '../components/context/FormKitContext';

/**
 * Options for useFieldArray hook
 */
export interface UseFieldArrayOptions {
  /** Field key that contains the array */
  name: string;
  /** Minimum number of rows */
  minRows?: number;
  /** Maximum number of rows */
  maxRows?: number;
}

/**
 * Return type for useFieldArray hook
 */
export interface UseFieldArrayReturn<TRow = Record<string, FieldValue>> {
  /** Current array of rows */
  fields: TRow[];
  /** Number of rows */
  count: number;
  /** Whether more rows can be added */
  canAdd: boolean;
  /** Whether rows can be removed */
  canRemove: boolean;

  /** Append a new row to the end */
  append: (value: TRow) => void;
  /** Prepend a new row to the beginning */
  prepend: (value: TRow) => void;
  /** Insert a row at a specific index */
  insert: (index: number, value: TRow) => void;
  /** Remove a row at a specific index */
  remove: (index: number) => void;
  /** Move a row from one index to another */
  move: (from: number, to: number) => void;
  /** Swap two rows */
  swap: (indexA: number, indexB: number) => void;
  /** Update a row at a specific index */
  update: (index: number, value: TRow) => void;
  /** Replace entire array */
  replace: (values: TRow[]) => void;
}

/**
 * Hook for managing repeatable field groups (arrays)
 * Used internally by ArrayField component
 *
 * @param options - Field array configuration
 * @returns Field array state and methods
 *
 * @example
 * ```tsx
 * const { fields, append, remove, canAdd, canRemove } = useFieldArray({
 *   name: 'contacts',
 *   minRows: 1,
 *   maxRows: 5,
 * });
 * ```
 */
export function useFieldArray<TRow = Record<string, FieldValue>>(
  options: UseFieldArrayOptions,
): UseFieldArrayReturn<TRow> {
  const { name, minRows = 0, maxRows = Infinity } = options;
  const { getValue, setValue } = useFormKitContext();

  // Get current array value
  const fields = useMemo(() => {
    const value = getValue(name);
    return (Array.isArray(value) ? value : []) as TRow[];
  }, [getValue, name]);

  const count = fields.length;
  const canAdd = count < maxRows;
  const canRemove = count > minRows;

  // Append row
  const append = useCallback(
    (value: TRow) => {
      if (!canAdd) return;
      setValue(name, [...fields, value] as FieldValue);
    },
    [canAdd, fields, name, setValue],
  );

  // Prepend row
  const prepend = useCallback(
    (value: TRow) => {
      if (!canAdd) return;
      setValue(name, [value, ...fields] as FieldValue);
    },
    [canAdd, fields, name, setValue],
  );

  // Insert at index
  const insert = useCallback(
    (index: number, value: TRow) => {
      if (!canAdd) return;
      const newFields = [...fields];
      newFields.splice(index, 0, value);
      setValue(name, newFields as FieldValue);
    },
    [canAdd, fields, name, setValue],
  );

  // Remove at index
  const remove = useCallback(
    (index: number) => {
      if (!canRemove) return;
      setValue(name, fields.filter((_, i) => i !== index) as FieldValue);
    },
    [canRemove, fields, name, setValue],
  );

  // Move row
  const move = useCallback(
    (from: number, to: number) => {
      if (from < 0 || from >= count || to < 0 || to >= count) return;
      const newFields = [...fields];
      const [removed] = newFields.splice(from, 1);
      newFields.splice(to, 0, removed);
      setValue(name, newFields as FieldValue);
    },
    [count, fields, name, setValue],
  );

  // Swap rows
  const swap = useCallback(
    (indexA: number, indexB: number) => {
      if (indexA < 0 || indexA >= count || indexB < 0 || indexB >= count) return;
      const newFields = [...fields];
      [newFields[indexA], newFields[indexB]] = [newFields[indexB], newFields[indexA]];
      setValue(name, newFields as FieldValue);
    },
    [count, fields, name, setValue],
  );

  // Update row
  const update = useCallback(
    (index: number, value: TRow) => {
      if (index < 0 || index >= count) return;
      const newFields = [...fields];
      newFields[index] = value;
      setValue(name, newFields as FieldValue);
    },
    [count, fields, name, setValue],
  );

  // Replace all
  const replace = useCallback(
    (values: TRow[]) => {
      setValue(name, values as FieldValue);
    },
    [name, setValue],
  );

  return {
    fields,
    count,
    canAdd,
    canRemove,
    append,
    prepend,
    insert,
    remove,
    move,
    swap,
    update,
    replace,
  };
}

/**
 * Field helper utilities for FormKit UI
 */

import type { FieldValue } from './types';

/**
 * Format a field value to a string for display
 * @param value - The field value to format
 * @returns Formatted string representation
 */
export function formatFieldValue(value: FieldValue): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }

  if (typeof value === 'number') {
    return String(value);
  }

  if (value instanceof File) {
    return value.name;
  }

  if (Array.isArray(value)) {
    // Check if it's a File array
    const isFileArray = value.length > 0 && value.every((v) => v instanceof File);
    if (isFileArray) {
      return value.map((f) => (f as File).name).join(', ');
    }
    // For other arrays, join their string representations
    return value.map((v) => String(v)).join(', ');
  }

  return String(value);
}

/**
 * Sanitize user input by trimming whitespace
 * @param value - The input value
 * @returns Sanitized value
 */
export function sanitizeInput(value: string): string {
  return value.trim();
}

/**
 * Sanitize user input and collapse multiple spaces
 * @param value - The input value
 * @returns Sanitized value with single spaces
 */
export function sanitizeInputStrict(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

/**
 * Check if a field value is empty
 * @param value - The field value to check
 * @returns True if the value is considered empty
 */
export function isEmpty(value: FieldValue): boolean {
  if (value === null || value === undefined) {
    return true;
  }

  if (typeof value === 'string') {
    return value.trim() === '';
  }

  if (typeof value === 'number') {
    return false; // 0 is not considered empty
  }

  if (typeof value === 'boolean') {
    return false; // false is not considered empty
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  return false;
}

/**
 * Normalize a value to a specific type
 * @param value - The value to normalize
 * @param type - Target type ('string' | 'number' | 'boolean')
 * @returns Normalized value
 */
export function normalizeValue(
  value: FieldValue,
  type: 'string' | 'number' | 'boolean',
): string | number | boolean | null {
  if (value === null || value === undefined) {
    return null;
  }

  switch (type) {
    case 'string':
      return String(value);

    case 'number': {
      if (typeof value === 'number') {
        return value;
      }
      const parsed = Number(value);
      return isNaN(parsed) ? null : parsed;
    }

    case 'boolean': {
      if (typeof value === 'boolean') {
        return value;
      }
      if (typeof value === 'string') {
        const lower = value.toLowerCase();
        if (lower === 'true' || lower === '1') return true;
        if (lower === 'false' || lower === '0') return false;
      }
      return Boolean(value);
    }

    default:
      return null;
  }
}

/**
 * Generate a unique field ID
 * @param name - Field name
 * @param prefix - Optional prefix
 * @returns Unique field ID
 */
export function generateFieldId(name: string, prefix = 'field'): string {
  return `${prefix}-${name}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Parse a field path (e.g., "user.address.street") into parts
 * @param path - Dot-notation field path
 * @returns Array of path segments
 */
export function parseFieldPath(path: string): string[] {
  return path.split('.').filter(Boolean);
}

/**
 * Get a nested value from an object using a field path
 * @param obj - The object to query
 * @param path - Dot-notation field path
 * @returns The value at the path, or undefined
 */
export function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const parts = parseFieldPath(path);
  let current: unknown = obj;

  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }

  return current;
}

/**
 * Set a nested value in an object using a field path
 * @param obj - The object to modify
 * @param path - Dot-notation field path
 * @param value - The value to set
 * @returns New object with the value set
 */
export function setNestedValue(
  obj: Record<string, unknown>,
  path: string,
  value: unknown,
): Record<string, unknown> {
  const parts = parseFieldPath(path);
  const result = { ...obj };
  let current: Record<string, unknown> = result;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!(part in current) || typeof current[part] !== 'object') {
      current[part] = {};
    } else {
      current[part] = { ...(current[part] as Record<string, unknown>) };
    }
    current = current[part] as Record<string, unknown>;
  }

  current[parts[parts.length - 1]] = value;
  return result;
}

/**
 * Compare two field values for equality
 * @param a - First value
 * @param b - Second value
 * @returns True if values are equal
 */
export function areValuesEqual(a: FieldValue, b: FieldValue): boolean {
  if (a === b) {
    return true;
  }

  if (a === null || a === undefined || b === null || b === undefined) {
    return a === b;
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return false;
    }
    return a.every((item, index) => areValuesEqual(item, b[index]));
  }

  return false;
}

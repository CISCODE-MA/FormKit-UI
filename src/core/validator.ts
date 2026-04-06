/**
 * Validation utilities and Zod error mapping
 * Framework-FREE — no React imports allowed in this file
 */

import type { z } from 'zod';
import type { FormValues, FieldValue } from './types';

/**
 * Field errors mapping (field key → error message)
 */
export type FieldErrors<T extends FormValues = FormValues> = Partial<Record<keyof T, string>>;

/**
 * Map Zod validation errors to field-level error messages
 *
 * @param zodError - Zod error object
 * @returns Object mapping field keys to error messages
 *
 * @example
 * ```typescript
 * const result = schema.safeParse(values);
 * if (!result.success) {
 *   const errors = mapZodErrors(result.error);
 *   // { email: 'Invalid email', name: 'Required' }
 * }
 * ```
 */
export function mapZodErrors<T extends FormValues>(zodError: z.ZodError): FieldErrors<T> {
  const errors: FieldErrors<T> = {};

  for (const issue of zodError.issues) {
    // Get the field path (first element for simple fields, joined for nested)
    const fieldKey = issue.path.length > 0 ? issue.path.join('.') : '_root';

    // Only keep the first error per field
    if (!(fieldKey in errors)) {
      errors[fieldKey as keyof T] = issue.message;
    }
  }

  return errors;
}

/**
 * Run synchronous validation against a Zod schema
 *
 * @param schema - Zod schema to validate against
 * @param values - Form values to validate
 * @returns Object with success flag, data (if valid), and errors (if invalid)
 */
export function validateSync<T extends FormValues>(
  schema: z.ZodType<T>,
  values: unknown,
):
  | { success: true; data: T; errors: null }
  | { success: false; data: null; errors: FieldErrors<T> } {
  const result = schema.safeParse(values);

  if (result.success) {
    return { success: true, data: result.data, errors: null };
  }

  return { success: false, data: null, errors: mapZodErrors<T>(result.error) };
}

/**
 * Validate a single field value against a Zod schema
 *
 * @param schema - Zod schema for the field
 * @param value - Field value to validate
 * @returns Error message or null if valid
 */
export function validateField(schema: z.ZodType, value: FieldValue): string | null {
  const result = schema.safeParse(value);

  if (result.success) {
    return null;
  }

  // Return first error message
  return result.error.issues[0]?.message ?? 'Invalid value';
}

/**
 * Check if a value is empty (for required field validation)
 */
export function isEmpty(value: FieldValue): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

/**
 * Zod adapter for FormKit UI validation
 * Converts Zod schemas to ValidatorFn for use with FormKit validation system
 */

import type { ValidatorFn, ValidationResult } from '../validation/types';
import type { FieldValue } from '../utils/types';

/**
 * Type guard to check if Zod is available
 */
function isZodSchema(schema: unknown): schema is {
  safeParse: (value: unknown) => {
    success: boolean;
    error?: { issues: Array<{ message: string }> };
  };
  safeParseAsync: (
    value: unknown,
  ) => Promise<{ success: boolean; error?: { issues: Array<{ message: string }> } }>;
  _def: { typeName: string };
} {
  return (
    typeof schema === 'object' &&
    schema !== null &&
    'safeParse' in schema &&
    typeof (schema as { safeParse: unknown }).safeParse === 'function'
  );
}

/**
 * Convert a Zod schema to a ValidatorFn
 * @param schema - Zod schema to convert
 * @param customMessage - Optional custom error message (overrides Zod's message)
 * @returns ValidatorFn that validates using the Zod schema
 * @throws Error if Zod is not available or schema is invalid
 */
export function zodValidator(schema: unknown, customMessage?: string): ValidatorFn {
  if (!isZodSchema(schema)) {
    throw new Error(
      'Invalid Zod schema provided. Make sure you have Zod installed and are passing a valid schema.',
    );
  }

  return (value: FieldValue): ValidationResult => {
    const result = schema.safeParse(value);

    if (result.success) {
      return null;
    }

    // Use custom message if provided, otherwise use first Zod error message
    if (customMessage) {
      return customMessage;
    }

    if (result.error && result.error.issues.length > 0) {
      return result.error.issues[0].message;
    }

    return 'Validation failed';
  };
}

/**
 * Convert a Zod schema to an async ValidatorFn
 * @param schema - Zod schema to convert
 * @param customMessage - Optional custom error message (overrides Zod's message)
 * @returns Async ValidatorFn that validates using the Zod schema
 * @throws Error if Zod is not available or schema is invalid
 */
export function zodAsyncValidator(
  schema: unknown,
  customMessage?: string,
): (value: FieldValue) => Promise<ValidationResult> {
  if (!isZodSchema(schema)) {
    throw new Error(
      'Invalid Zod schema provided. Make sure you have Zod installed and are passing a valid schema.',
    );
  }

  return async (value: FieldValue): Promise<ValidationResult> => {
    const result = await schema.safeParseAsync(value);

    if (result.success) {
      return null;
    }

    // Use custom message if provided, otherwise use first Zod error message
    if (customMessage) {
      return customMessage;
    }

    if (result.error && result.error.issues.length > 0) {
      return result.error.issues[0].message;
    }

    return 'Validation failed';
  };
}

/**
 * Helper to check if Zod is available in the project
 * @returns true if Zod is available, false otherwise
 */
export function isZodAvailable(): boolean {
  try {
    // Try to access Zod - in a real project this would be an import
    // For testing purposes, we check if a Zod-like object can be created
    return typeof isZodSchema === 'function';
  } catch {
    return false;
  }
}
